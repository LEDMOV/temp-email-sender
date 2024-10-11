// Import required modules
import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

// Create an instance of Express
const app = express();
const PORT = 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set up the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-app-password', // Your app password or email password
    },
});

// Function to generate a temporary email
async function generateTemporaryEmail() {
    const response = await fetch('https://api.guerrillamail.com/ajax.php?f=new_email');
    const data = await response.json();
    return data.email_addr; // Returns the temporary email address
}

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Handle form submission
app.post('/send-email', async (req, res) => {
    try {
        const recipientEmail = req.body.email;
        const tempEmail = await generateTemporaryEmail(); // Generate temporary email

        const mailOptions = {
            from: 'your-email@gmail.com', // Sender's email address
            to: recipientEmail, // Recipient's email address
            subject: 'Temporary Email',
            text: `This email was sent using the temporary email: ${tempEmail}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send('Error sending email: ' + error.toString());
            }
            res.send(`Email sent successfully to ${recipientEmail} from ${tempEmail}`);
        });
    } catch (error) {
        res.status(500).send('Error generating temporary email: ' + error.message);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
