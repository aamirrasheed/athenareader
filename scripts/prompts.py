BLOGPOST_CLASSIFICATION_AND_EXTRACT_TITLE_DATE = '''I need you to act as a blogpost classifier
and title and date extractor. You're extremely well read on the internet, and have incredible
skill when it comes to discerning whether an article is a blogpost or not and what the date and
title of the article or blogpost is.

I'm going to give you the URL and text body of the webpage. Based on these two pieces of information,
I want you to give me your best guess as to whether it's a article/blogpost, and if it's a blogpost, 
the title and date.  If it's not a blogpost (for example, a bio page, an index of posts, or any other
non-blogpost page), I don't need the title or date. 

Importantly, some blogposts may be paywalled with a preview. If you can't access the full text of the 
blog post, classify it as a blogpost anyway.

I want the format of your answer to be JSON.

If you can't figure out the title or date, just output an empty string for it. 

When it comes to the date, give it your best guess. I don't need the time of day. 
Always output it in this format: "day-month-year", even if you don't know one of those pieces of 
information. For example, if you only know that the post was published in July of 2014, output "-7-2014"
with empty string for the day. Do not deviate from this format.

Here's an example of the input I'd give you (I've substituted the actual body text with <placeholder>):

URL: http://www.paulgraham.com/addiction.html
Body: <placeholder>

It's a blogpost, so here's what I expect from you:
{
    "blogpost": "yes",
    "title": "The Acceleration of Addictiveness",
    "date": "-7-2010"
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
