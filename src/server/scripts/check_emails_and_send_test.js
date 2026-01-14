require('dotenv').config();
const jwt = require('jsonwebtoken');

(async function main() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not set in environment for this process.');
    process.exit(1);
  }

  const token = jwt.sign({ id: 'script-admin', username: 'script-admin', role: 'admin' }, secret, { expiresIn: '2h' });

  try {
    console.log('Calling /api/admin/list-emails');
    try {
      const listResp = await fetch('http://localhost:3000/api/admin/list-emails', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('/api/admin/list-emails status:', listResp.status);
      const listJson = await listResp.json();
      console.log('List emails response body:', listJson);
    } catch (err) {
      console.error('Error calling list-emails:', err);
      throw err;
    }

    console.log('Calling /api/appointments');
    let appts;
    try {
      const apptResp = await fetch('http://localhost:3000/api/appointments?page=1&limit=1', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('/api/appointments status:', apptResp.status);
      appts = await apptResp.json();
      console.log('Appointments body:', appts);
    } catch (err) {
      console.error('Error calling appointments:', err);
      throw err;
    }

    if (!Array.isArray(appts) || appts.length === 0) {
      console.log('No appointments returned from server; create an appointment first.');
      process.exit(0);
    }
    const appt = appts[0];
    console.log('Using appointment id:', appt.id, 'title:', appt.title);

    console.log(`Calling /api/admin/send-test-email/${appt.id}`);
    try {
      const sendResp = await fetch(`http://localhost:3000/api/admin/send-test-email/${appt.id}`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('/api/admin/send-test-email status:', sendResp.status);
      const sendJson = await sendResp.json();
      console.log('Send test email response:', sendJson);
      if (sendJson && sendJson.preview) console.log('Ethereal preview URL:', sendJson.preview);
    } catch (err) {
      console.error('Error calling send-test-email:', err);
      throw err;
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during HTTP checks:', err);
    process.exit(2);
  }

})();
require('dotenv').config();
const jwt = require('jsonwebtoken');

async function main() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not set in environment for this process.');
    process.exit(1);
  }

  // generate an admin token (server only validates signature + role)
  const token = jwt.sign({ id: 'script-admin', username: 'script-admin', role: 'admin' }, secret, { expiresIn: '2h' });

  try {
    console.log('Calling /api/admin/list-emails');
    let listJson;
    try {
      const listResp = await fetch('http://localhost:3000/api/admin/list-emails', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      listJson = await listResp.json();
      console.log('List emails response status:', listResp.status);
      console.log('List emails response body:', listJson);
    } catch (err) {
      console.error('Error calling list-emails:', err);
      throw err;
    }

    console.log('Calling /api/appointments');
    let appts;
    try {
      const apptResp = await fetch('http://localhost:3000/api/appointments?page=1&limit=1', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('/api/appointments status:', apptResp.status);
      appts = await apptResp.json();
      console.log('Appointments body:', appts);
    } catch (err) {
      console.error('Error calling appointments:', err);
      throw err;
    }

    if (!Array.isArray(appts) || appts.length === 0) {
      console.log('No appointments returned from server; create an appointment first.');
      process.exit(0);
    }
    const appt = appts[0];
    console.log('Using appointment id:', appt.id, 'title:', appt.title);

    console.log(`Calling /api/admin/send-test-email/${appt.id}`);
    try {
      const sendResp = await fetch(`http://localhost:3000/api/admin/send-test-email/${appt.id}`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('/api/admin/send-test-email status:', sendResp.status);
      const sendJson = await sendResp.json();
      console.log('Send test email response:', sendJson);
      if (sendJson && sendJson.preview) console.log('Ethereal preview URL:', sendJson.preview);
    } catch (err) {
      console.error('Error calling send-test-email:', err);
      throw err;
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during HTTP checks:', err);
    process.exit(2);
  }
}

main();
require('dotenv').config();
const jwt = require('jsonwebtoken');

async function main() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not set in environment for this process.');
    process.exit(1);
  }

  // generate an admin token (server only validates signature + role)
  const token = jwt.sign({ id: 'script-admin', username: 'script-admin', role: 'admin' }, secret, { expiresIn: '2h' });

  try {
    // list emails via admin endpoint
    const listResp = await fetch('http://localhost:3000/api/admin/list-emails', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const listJson = await listResp.json();
    console.log('List emails response:', listJson);

    // fetch one appointment via appointments API (requires staff/admin)
    const apptResp = await fetch('http://localhost:3000/api/appointments?page=1&limit=1', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const appts = await apptResp.json();
    if (!Array.isArray(appts) || appts.length === 0) {
      console.log('No appointments returned from server; create an appointment first.');
      process.exit(0);
    }
    const appt = appts[0];
    console.log('Using appointment id:', appt.id, 'title:', appt.title);

    const sendResp = await fetch(`http://localhost:3000/api/admin/send-test-email/${appt.id}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const sendJson = await sendResp.json();
    console.log('Send test email response:', sendJson);
    if (sendJson && sendJson.preview) console.log('Ethereal preview URL:', sendJson.preview);

    process.exit(0);
  } catch (err) {
    console.error('Error during HTTP checks:', err);
    process.exit(2);
  }
}

main();
    const appt = appts[0];
    console.log('Using appointment id:', appt.id, 'title:', appt.title);

    // call admin test-email endpoint
    const resp = await fetch(`http://localhost:3000/api/admin/send-test-email/${appt.id}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    const json = await resp.json();
    console.log('Admin send-test-email response:', json);

    if (json && json.preview) {
      console.log('Ethereal preview URL:', json.preview);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during checks:', err);
    process.exit(2);
  }
}

main();
