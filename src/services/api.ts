import axios from 'axios';
import { AGENT_Listener_URL } from '../config/constants';



const api = axios.create({
  baseURL: 'https://w80khfvj-3001.inc1.devtunnels.ms/', // bank server
});

export const connectWithWallet = async () => {
  const response = await api.get('/auth/connect');
  return response.data;
};

export const loginWithDid = async (did: string, connection_id: string) => {
  const retryInterval = 5000; // Retry every 5 seconds
  const maxDuration = 5 * 60 * 1000; // 5 minutes
  const startTime = Date.now();

  try {
    // Send the proof request to the wallet
    const response = await api.post('/auth/login', { did });
    console.log('Login response:', response);
    
    if (response.status === 200) {
      alert(response.data.message);
      console.log('Proof request sent:', response.data);
      const thread_id = response.data.data.thread_id;  

      // Poll the server for proof verification status
      while (Date.now() - startTime < maxDuration) {
        try {
          const proofResponse = await api.get(`${AGENT_Listener_URL}/events/proof-status/${connection_id}/${thread_id}`);
          console.log('Proof status response:', proofResponse.data);

          if (proofResponse.data.verified) {
            alert('Proof verified successfully.');
            console.log('Proof verified successfully.');

            // fetch user details
            const userDetails = await api.get(`/auth/user-details/${connection_id}`);
            console.log('User details:', userDetails.data);

            return { data: proofResponse.data, userData: userDetails.data, message: 'Proof verified successfully.', success: true };
          }
        } catch (error) {
          console.error('Error checking proof status:', error);
        }

        // Wait for the retry interval before trying again
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  } catch (error) {
    console.error('Login attempt failed:', error);
  }

  // If the loop exits, it means the timeout was reached
  return { error: 'Timeout reached', message: 'Login failed after 5 minutes.', success: false };
};


export const requestPermissionProof = async (connection_id: string) => {
  // 1. Trigger proof request
  const response = await api.post('/auth/request-permissions-proof', { connection_id });
  console.log('Permission proof request response:', response);
  if (response.status !== 200) {
    throw new Error('Permission proof request failed');
  }
  if (response.status === 200) {
    alert(response.data.message);
    console.log('Permission proof request sent Response:', response.data);
  }

  // Extract thread_id from the response
  const { thread_id } = response.data.data;

  // 2. Poll for proof verification
  const retryInterval = 5000;
  const maxDuration = 5 * 60 * 1000;
  const startTime = Date.now();

  let proofRes = null;
  while (Date.now() - startTime < maxDuration) {
    try {
      proofRes = await api.get(`${AGENT_Listener_URL}/events/proof-status/${connection_id}/${thread_id}`);
      console.log('Permission proof status response:', proofRes.data);
      if (proofRes.data.verified) {
        console.log('Permission proof verified successfully validating delegations.', proofRes.data);
        break;
      }
    } catch (error) {
      // ignore and retry
      console.error('Error checking proof status:', error);
    }
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  if(!proofRes || !proofRes.data.verified) {
    console.log('Permission proof verification failed or timed out.');
    return { success: false, error: "Timeout waiting for permission proof failed" };
  }


 // 1. Get the requested_attributes object
  const requestedAttrs = proofRes.data?.by_format?.pres_request?.indy?.requested_attributes || {};
 // 2. Find the property name (key) for delegation_id
  const delegationIdProp = Object.entries(requestedAttrs).find(
    ([, attr]: any) => attr.name === 'delegation_id')?.[0];
    console.log('delegationIdProp:', delegationIdProp); // e.g., "additionalProp1"
// 3. Use the property name to get the value from revealed_attrs
  const revealedAttrs = proofRes.data?.by_format?.pres?.indy?.requested_proof?.revealed_attrs || {};
  const delegationId = delegationIdProp ? revealedAttrs[delegationIdProp]?.raw : undefined;
  console.log('delegationId:', delegationId);

  if(!delegationId) {
    console.log('delegationId not found in revealed attributes.');
    return { success: false, error: "delegationId not found in revealed attributes." };
  }
  // 4. Fetch the permission credential using the delegation_id
  try{
    const permissionCred = await api.get(`/auth/permissions/${delegationId}`);
    console.log(permissionCred, "permissionCred response");
    // Return the revealed permission credential
    return { success: true, data: proofRes.data, credential: permissionCred.data, message:"proof verified successfully" };
  }catch (error) {
    console.error('Error fetching permission credential:', error.response ? error.response.data : error);
    return { success: false, message: "Error fetching or validating permission credential", error: error.response ? error.response.data : error };
  }
  
};

export const fetchAllEmployees = async () => {
  const response = await api.get('/auth/employees');
  return response.data;
};
