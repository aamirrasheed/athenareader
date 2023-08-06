from bs4 import BeautifulSoup

# Your partial HTML content
html_content = """
<html><head><meta name="Keywords" content="" /><title>How to Do Great Work</title><!-- <META NAME="ROBOTS" CONTENT="NOODP"> -->
<link rel="shortcut icon" href="http://ycombinator.com/arc/arc.png">
</head><body bgcolor="#ffffff" background="https://s.turbifycdn.com/aah/paulgraham/essays-4.gif" text="#000000" link="#000099" vlink="#464646"><table border="0" cellspacing="0" cellpadding="0"><tr valign="top"><td><map name=1aa3e64a4ac33b><area shape=rect coords="0,0,67,21" href="index.html"><area shape=rect coords="0,21,67,42" href="articles.html"><area shape=rect coords="0,42,67,63" href="http://www.amazon.com/gp/product/0596006624"><area shape=rect coords="0,63,67,84" href="books.html"><area shape=rect coords="0,84,67,105" href="http://ycombinator.com"><area shape=rect coords="0,105,67,126" href="arc.html"><area shape=rect coords="0,126,67,147" href="bel.html"><area shape=rect coords="0,147,67,168" href="lisp.html"><area shape=rect coords="0,168,67,189" href="antispam.html"><area shape=rect coords="0,189,67,210" href="kedrosky.html"><area shape=rect coords="0,210,67,231" href="faq.html"><area shape=rect coords="0,231,67,252" href="raq.html"><area shape=rect coords="0,252,67,273" href="quo.html"><area shape=rect coords="0,273,67,294" href="rss.html"><area shape=rect coords="0,294,67,315" href="bio.html"><area shape=rect coords="0,315,67,336" href="https://twitter.com/paulg"><area shape=rect coords="0,336,67,357" href="https://mas.to/@paulg"></map><img src="https://s.turbifycdn.com/aah/paulgraham/essays-5.gif" width="69" height="357" usemap=#1aa3e64a4ac33b border="0" hspace="0" vspace="0" ismap /></td><td><img src="https://sep.turbifycdn.com/ca/Img/trans_1x1.gif" height="1" width="26" border="0" /></td><td><a href="index.html"><img src="https://s.turbifycdn.com/aah/paulgraham/essays-6.gif" width="410" height="45" border="0" hspace="0" vspace="0" /></a><br /><br /><table border="0" cellspacing="0" cellpadding="0" width="435"><tr valign="top"><td width="435"><img src="https://s.turbifycdn.com/aah/paulgraham/how-to-do-great-work-1.gif" width="185" height="18" border="0" hspace="0" vspace="0" alt="How to Do Great Work" /><br /><br /><font size="2" face="verdana">July 2023<br /><br />If you collected lists of techniques for doing great work in a lot
of different fields, what would the intersection look like? I decided
to find out by making it.<br /><br />Partly my goal was to create a guide that could be used by someone
working in any field. But I was also curious about the shape of the
intersection. And one thing this exercise shows is that it does
have a definite shape; it's not just a point labelled "work hard."<br /><br />The following recipe assumes you're very ambitious.<br /><br /><br /><br /><br /><br />
The first step is to decide what to work on. The work you choose
needs to have three qualities: it has to be something you have a
natural aptitude for, that you have a deep interest in, and that
offers scope to do great work.<br /><br />In practice you don't have to worry much about the third criterion.
Ambitious people are if anything already too conservative about it.
So all you need to do is find something you have an aptitude for
and great interest in.
<font color=#dddddd>[<a href="#f1n"><font color=#dddddd>1</font></a>]</font><br /><br />That sounds straightforward, but it's often quite difficult. When
you're young you don't know what you're good at or what different
kinds of work are like. Some kinds of work you end up doing may not
even exist yet. So while some people know what they want to do at
14, most have to figure it out.<br /><br />The way to figure out what to work on is by working. If you're not
sure what to work on, guess. But pick something and get going.
You'll probably guess wrong some of the time, but that's fine. It's
good to know about multiple things; some of the biggest discoveries
come from noticing connections between different fields.<br /><br />Develop a habit of working on your own projects. Don't let "work"
mean something other people tell you to do. If you do manage to do
great work one day, it will probably be on a project of your own.
It may be within some bigger project, but you'll be driving your
part of it.<br /><br />What should your projects be? Whatever seems to you excitingly
ambitious. As you grow older and your taste in projects evolves,
exciting and important will converge. At 7 it may seem excitingly
ambitious to build huge things out of Lego, then at 14 to teach
yourself calculus, till at 21 you're starting to explore unanswered
questions in physics. But always preserve excitingness.<br /><br />There's a kind of excited curiosity that's both the engine and the
rudder of great work. It will not only drive you, but if you let
it have its way, will also show you what to work on.<br /><br />What are you excessively curious about &mdash; curious to a degree that
would bore most other people? That's what you're looking for.<br /><br />Once you've found something you're excessively interested in, the
next step is to learn enough about it to get you to one of the
frontiers of knowledge. Knowledge expands fractally, and from a
distance its edges look smooth, but once you learn enough to get
close to one, they turn out to be full of gaps.<br /><br />The next step is to notice them. This takes some skill, because
your brain wants to ignore such gaps in order to make a simpler
model of the world. Many discoveries have come from asking questions
about things that everyone else took for granted. 
<font color=#dddddd>[<a href="#f2n"><font color=#dddddd>2</font></a>]</font><br /><br />If the answers seem strange, so much the better. Great work often
"""

# Create a BeautifulSoup object
soup = BeautifulSoup(html_content, 'html.parser')

# Find the main content within the <body> tag
main_content = soup.find('body')

# Extract and print the article text without HTML tags
article_text = main_content.get_text(separator="\n", strip=True)
print(article_text)