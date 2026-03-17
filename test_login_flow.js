
const API_URL = 'http://localhost:4000/api/auth';
const EMAIL = 'test_user_' + Date.now() + '@example.com';

async function test() {
  console.log('--- Starting Login Flow Test ---');
  console.log('Target Email:', EMAIL);

  try {
    // 1. Send OTP
    console.log('\n1. Sending OTP...');
    const sendRes = await fetch(`${API_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL })
    });
    
    const sendData = await sendRes.json();
    console.log('Send Response:', JSON.stringify(sendData, null, 2));
    
    if (!sendData.success) throw new Error('Send OTP failed: ' + (sendData.error || sendData.message));
    if (!sendData.otp) throw new Error('OTP not returned in dev mode. Ensure NODE_ENV=development');
    
    const otp = sendData.otp;
    console.log('Received OTP:', otp);

    // 2. Verify OTP
    console.log('\n2. Verifying OTP...');
    const verifyRes = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, otp })
    });

    const verifyData = await verifyRes.json();
    console.log('Verify Response:', JSON.stringify(verifyData, null, 2));

    if (!verifyData.success) throw new Error('Verify OTP failed: ' + (verifyData.error || verifyData.message));
    if (!verifyData.token) throw new Error('Token missing in response');

    console.log('\nSUCCESS: Login flow verified!');
    console.log('Token:', verifyData.token);
    console.log('User:', verifyData.data.name);

  } catch (err) {
    console.error('\nFAILURE:', err.message);
    if (err.cause) console.error(err.cause);
  }
}

test();
