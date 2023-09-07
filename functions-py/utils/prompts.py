BLOGPOST_CLASSIFICATION_AND_EXTRACT_TITLE_DATE = '''
I'm going to give you the URL and text body of a webpage. Based on these two pieces of information,
I want you to tell me if it's a blogpost/article or not. If yes, I'd also like to know the title, 
date, and summary of the blogpost.

If you can't figure out the title or date, just output an empty string for it. 

Always output date in this format: "day-month-year", even if you don't know one of them.
For example, if you only know that the post was published in July of 2014, output "-7-2014"
with an empty string for the day. Do not deviate from this format.

For the summary, limit it to 100 characters. Make it a hook for the article. Entice the user
to click on the post.  

I want the format of your answer to be JSON.

Here's an example of the input I'd give you (I've substituted the actual body text with <placeholder>):

URL: http://www.paulgraham.com/addiction.html
Body: <placeholder>

It's a blogpost, so here's what I expect from you:
{
    "blogpost": "yes",
    "title": "The Acceleration of Addictiveness",
    "date": "-7-2010",
    "summary": <Your best summary of the post following directions above>
}

If you don't believe the input is a blogpost, I expect this:
{
    "blogpost": "no"
}

Some final directions: 
-Do not respond with anything else except the format I described above.
-Extraneous characters would be harmful.
-Give it your best guess.
-Do not put a trailing comma on the last JSON entry

Okay, here's my input to you:

'''
