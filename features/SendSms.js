
const accountSid = 'AC673101fcbc0ab08a42956d57d229e32d';
const authToken = 'b14c293d31da0396c63c131879632456';
const client = require('twilio')(accountSid, authToken);




client.messages
    .create({
        body: 'sent from nodejs',
        from: '+14347322928',
        to: '+37499212408'
    })
    .then(message => console.log(message.sid))
    .catch(error => console.log(error));
