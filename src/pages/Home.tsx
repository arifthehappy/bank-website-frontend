import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, LogIn, QrCode, User, UserPlus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { connectWithWallet } from "../services/api";
import { useConnectionResponse } from "../store/auth";
import { AGENT_Listener_URL } from "../config/constants";
import { create } from "zustand";

export default function Home() {
  const navigate = useNavigate();

  const [connectionInvitation, setConnectionInvitation] = React.useState<{
    isLoading: boolean;
    error: string | null;
    connectionInvitation?: any;
  }>({ isLoading: false, error: null });

  const createInvitation = async () => {
    try {
      setActiveConnection(null);
      sessionStorage.removeItem("activeConnection");
      // Clear any previous invitations and create a new one
      setConnectionInvitation({ isLoading: true, error: null });
      const invitation = await connectWithWallet();
      setConnectionInvitation({
        isLoading: false,
        error: null,
        connectionInvitation: invitation,
      });
    } catch (error) {
      console.error(error);
      setConnectionInvitation({
        isLoading: false,
        error: "Failed to create connection invitation",
      });
    }
  };

  console.log("Connection Invitation:", connectionInvitation);
  console.log(
    "connection response get state",
    useConnectionResponse.getState().connectionResponse
  );

  const [activeConnection, setActiveConnection] = React.useState<any>(() => {
    const storedData = sessionStorage.getItem("activeConnection");
    return storedData ? JSON.parse(storedData) : null;
  });

  console.log("activeConnection", activeConnection);

  // if connectionInvitation  is generated waiting for user to response then send to login page
  useEffect(() => {
    if (
      connectionInvitation.connectionInvitation &&
      !connectionInvitation.isLoading
    ) {
      const invi_msg_id = connectionInvitation.connectionInvitation.invi_msg_id;

      let connectionResponse: EventSource | null = null;

      let retries = 0;
      const maxRetries = 60;
      let responseReceived = false;

      const createConnectionResponse = async () => {
        if (responseReceived === true || retries > maxRetries) {
          connectionResponse?.close();
          console.log("Response already received or max retries reached");
          return;
        }

        try {
          connectionResponse = new EventSource(
            `${AGENT_Listener_URL}/events/connections/${invi_msg_id}`
          );

          connectionResponse.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Connection Response:", data);

            useConnectionResponse.getState().setConnectionResponse(data);
            sessionStorage.setItem("activeConnection", JSON.stringify(data));
            responseReceived = true;
            connectionResponse?.close();
            // Redirect to login page with connectionId
            console.log("Event received; stopping retries");

            navigate("/login", {
              state: {
                connectionId: data.connection_id,
              },
            });
          };

          connectionResponse.onerror = (error) => {
            console.error("Error in connection response:", error, retries);
            connectionResponse?.close();

            if (!responseReceived && retries < maxRetries) {
              console.log("Retrying connection response...", retries);
              retries++;
              setTimeout(createConnectionResponse, 2000);
            }
          };
        } catch (error) {
          console.error("Error creating connection response:", error);
          if (connectionResponse) {
            connectionResponse.close();
          }
        }
      };

      //invoke initial attempt
      createConnectionResponse();

      return () => {
        if (connectionResponse) {
          connectionResponse.close();
        }
      };
    }
  }, [
    connectionInvitation.connectionInvitation,
    connectionInvitation.isLoading,
    navigate,
  ]);

  const [manualConnectionInput, setManualConnectionInput] =
    React.useState<string>("");

  const handleSetManualConnection = () => {
    try {
      const parsedConnection = JSON.parse(manualConnectionInput);
      if (parsedConnection && parsedConnection.connection_id) {
        sessionStorage.setItem(
          "activeConnection",
          JSON.stringify(parsedConnection)
        );
        setActiveConnection(parsedConnection);
        alert("Active connection set successfully!");
        setManualConnectionInput(""); // Clear the input field
      } else {
        alert(
          "Invalid connection data. Please ensure the JSON contains a valid connection_id."
        );
      }
    } catch (error) {
      console.error("Error parsing connection JSON:", error);
      alert("Invalid JSON format. Please check your input.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Banking Portal
          </h1>
          <p className="text-gray-600">
            Connect with your SSI wallet to continue
          </p>
        </div>

        {connectionInvitation.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {connectionInvitation.error}
          </div>
        )}

        <div className="space-y-4">
          {connectionInvitation.isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Generating connection...</p>
            </div>
          ) : connectionInvitation.connectionInvitation ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={JSON.stringify(
                    connectionInvitation.connectionInvitation
                  )}
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>

              <div className="text-center">
                <p className="text-gray-600">or copy this invitation</p>
                <textarea
                  readOnly
                  className="w-full h-full p-2 mt-2 border rounded-lg overflow-auto "
                  value={JSON.stringify(
                    connectionInvitation.connectionInvitation.invitation,
                    null,
                    2
                  )}
                />
                <button
                  onClick={() =>
                    navigator.clipboard
                      .writeText(
                        JSON.stringify(
                          connectionInvitation.connectionInvitation.invitation,
                          null,
                          2
                        )
                      )
                      .then(() => {
                        alert("Invitation copied to clipboard!");
                      })
                  }
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy Invitation
                </button>
              </div>
              <p className="text-sm text-center text-gray-600">
                Scan this QR code with your SSI wallet to connect
              </p>
            </div>
          ) : (
            <button
              onClick={() => createInvitation()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <QrCode size={20} />
              <span>Generate New Connection QR</span>
            </button>
          )}
        </div>

        {/* active connections */}
        {activeConnection && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            <p>
              Active connection: {activeConnection.connection_id} -{" "}
              {activeConnection.state}
            </p>
            {/* login and register buttons */}
            <p className="text-sm text-gray-600">
              Click to login or register with this connection
            </p>
            <div className="flex items-center justify-center mt-2 gap-2 ">
              <button
                onClick={() => {
                  navigate("/login", {
                    state: {
                      connectionId: activeConnection.connection_id,
                    },
                  });
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
              <button
                onClick={() => {
                  navigate("/register", {
                    state: {
                      connectionId: activeConnection.connection_id,
                    },
                  });
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Get your ID
              </button>
            </div>

            {/* connection details */}
            <details className="text-sm text-600">
              <summary className="cursor-pointer">
                Click to view connection details
              </summary>
              <pre className="whitespace-pre-wrap overflow-auto">
                {JSON.stringify(activeConnection, null, 2)}
              </pre>
            </details>

            <button
              onClick={() => {
                sessionStorage.removeItem("activeConnection");
                setActiveConnection(null);
              }}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-red-400 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Clear Active Connection
            </button>
          </div>
        )}

        {/* Manually Set Active Connection */}
        <div className="mt-6">
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Already have a connection? Manually set it here
            </summary>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Paste your connection JSON below to set it as the active
                connection.
              </p>
              <textarea
                className="w-full h-64 p-2 border rounded-lg mb-4 text-sm"
                placeholder="Paste your connection JSON here"
                onChange={(e) => setManualConnectionInput(e.target.value)}
                value={manualConnectionInput}
              />
              <button
                onClick={handleSetManualConnection}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <User className="h-4 w-4" />
                Set Active Connection
              </button>
            </div>
          </details>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500">
            Need an SSI wallet? Download our recommended wallet app to get
            started.
          </p>
        </div>
      </div>
    </div>
  );
}
