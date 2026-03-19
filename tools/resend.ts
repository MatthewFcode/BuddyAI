import { Resend } from 'resend' // importing the resend class from the node modules

interface emailInput {
  to: string
  subject: string
  body: string
}
export async function sendEmail({ to, subject, body }: emailInput) {
  const resend = new Resend(process.env.RESEND_API_KEY) // client object that we use to send emails
  const response = await resend.emails.send({
    // waits for the email to be sent before moving on/ in our case exceuting our return line
    // resend method that actually sends the email
    from: 'onboarding@resend.dev',
    to,
    subject,
    html: `<p>${body}</p>`, // email body in HTML format (supported)
  })
  return response
}
