import axios from 'axios';
import { AGENT_Listener_URL } from '../config/constants';

const api = axios.create({
  baseURL: 'http://localhost:3001', // bank server
});

export const connectWithWallet = async () => {
  const response = await api.get('/auth/connect');
  return response.data;
};

// export const loginWithDid = async (did: string, connection_id: string) => {

//   const response = await api.post('/auth/login', { did: did });
//   console.log('Login response :', response); 
//   if (response.status !== 200) {
//     throw new Error('Login failed');
//   }
//   if(response.status === 200){
//     console.log('proof request send', response.data);
//     alert(response.data.message);

//     const retryInterval = 8000; // 5 seconds
//     const maxDuration = 5 * 60 * 1000; // 5 minutes
//     const startTime = Date.now();

//     let proofEventResponse: EventSource | null = null;

//     //check for event form agent listener for verification for 5 minutes else return timeout
//     try{
//       proofEventResponse = new EventSource(`${AGENT_Listener_URL}/events/present-proof/${connection_id}`);
// /*************  ✨ Windsurf Command ⭐  *************/
//   /**
//    * Handles the present-proof event received from the agent listener.
//    * If the event is received successfully, it closes the EventSource and returns the event data.
//    * If the event is not received successfully, it closes the EventSource and returns an error message.
//    * @param {MessageEvent} event
//    * @returns {Object} {data, message, success}
//    */
// /*******  81fd6ae6-a67c-4f19-9948-7d34ca21b9d3  *******/
//       proofEventResponse.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         console.log('Proof Event data:', data);

//           // Handle the event here
//           console.log('Present proof event received:', data);
          
//           if (proofEventResponse) {
//             proofEventResponse.close();
//           }
//           if(data.verified === true){
//             alert('Proof verified successfully.');
//             console.log('Proof verified successfully.');
//           return {data, message: 'Proof event received successfully.', success: true};
//           }
//           else{
//             alert('Proof verification failed.');
//             console.log('Proof verification failed.');
//             return {data, message: 'Proof event received successfully.', success: false};
//           }
//       };
//       proofEventResponse.onerror = (error) => {
//         console.error('EventSource error:', error);
//         alert('An error occurred while listening for events.');
//         if(proofEventResponse){
//         proofEventResponse.close();
//         }
//         // return ({error, message: 'An error occurred while listening for events.'});
//       }
//       setTimeout(() => {
//         if(proofEventResponse){
//         proofEventResponse.close();
//         }
//         console.log('Timeout reached, closing connection');
//       }, 5 * 60 * 1000); // 5 minutes
//     } catch (error) {
//       console.error('Error creating EventSource:', error);
//       alert('An error occurred while creating the event listener.');  
//       if(proofEventResponse){
//         proofEventResponse.close();
//       }
//       return {error, message: 'An error occurred while creating the event listener.'};
//     }
//   }
//     return {error: 'Login failed', message: 'Login failed', success: false}
// };


// export const loginWithDid = async (did: string, connection_id: string) => {
//   const retryInterval = 5000; // Retry every 5 seconds
//   const maxDuration = 5 * 60 * 1000; // 5 minutes
//   const startTime = Date.now();

//   let proofEventResponse: EventSource | null = null; // Explicitly typed as EventSource or null

//   const waitForProofEvent = async (): Promise<any> => {
//     return new Promise((resolve, reject) => {
//       try {
//         proofEventResponse = new EventSource(`${AGENT_Listener_URL}/events/present-proof/${connection_id}`);
        
//         proofEventResponse.onmessage = (event) => {
//           const data = JSON.parse(event.data);
//           console.log('Proof Event data:', data);

//           if (proofEventResponse) {
//             proofEventResponse.close();
//           }

//           if (data.verified === true) {
//             alert('Proof verified successfully.');
//             console.log('Proof verified successfully.');
//             resolve({ data, message: 'Proof event received successfully.', success: true });
//           } else {
//             alert('Proof verification failed.');
//             console.log('Proof verification failed.');
//             resolve({ data, message: 'Proof event received successfully.', success: false });
//           }
//         };

//         proofEventResponse.onerror = (error) => {
//           console.error('EventSource error:', error);
//           if (proofEventResponse) {
//             proofEventResponse.close();
//           }
//           reject(new Error('An error occurred while listening for events.'));
//         };
//       } catch (error) {
//         console.error('Error creating EventSource:', error);
//         if (proofEventResponse) {
//           proofEventResponse.close();
//         }
//         reject(new Error('An error occurred while creating the event listener.'));
//       }
//     });
//   };

  
//   try {
//     // send proof request to wallet
//     const response = await api.post('/auth/login', { did: did });
//     console.log('Login response:', response);

//     if (response.status === 200) {
//       alert(response.data.message);
//       console.log('Proof request sent:', response.data);

//       // wait for proof verification
//       while (Date.now() - startTime < maxDuration) {
//         try{
//         const proofResponse = await waitForProofEvent();
//         return proofResponse;
//         }
//         catch (error) {
//           console.error('Error waiting for proof event:', error);
//         }

//         // Wait for the retry interval before trying again
//         await new Promise((resolve) => setTimeout(resolve, retryInterval));
//       }
//     } 
//   }
//   catch (error) {
//     console.error('Login attempt failed sending proof request:', error);
//   }
  
//   // If the loop exits, it means the timeout was reached
//   if (proofEventResponse) {
//     proofEventResponse?.close();
//   }
//   return { error: 'Timeout reached', message: 'Login failed after 5 minutes.', success: false };
// };

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



// export const register = async (did: string, employeeNumber: string) => {
//   const response = await api.post('/auth/register', { did, employeeNumber });
//   return response.data;
// };