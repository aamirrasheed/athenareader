import resend 

resend.api_key = "re_SR2C7cWH_Jf5xcg6jUa7pi6qhi4JJSauu"

params = {
    "from": "Acme <support@athenareader.com>",
    "to": ["aamir@hey.com"],
    "subject": "hello world",
    "html": "<strong>it works!</strong>",
}

email = resend.Emails.send(params)
print(email)