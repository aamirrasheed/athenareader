import openai
import sys
from bs4 import BeautifulSoup
import requests
from urllib.parse import urlparse, urljoin

# step 1: Get the website URL
website_url = sys.argv[1]


# step 2: Scrape all links
hrefs = set()
def extract_links(url, existing_hrefs, max_depth=10, depth=0):
    if(depth == max_depth):
        print("max_depth reached, returning")
        return existing_hrefs

    print("scanning", url)
    found_hrefs = set()

    base_url = urlparse(url).scheme + "://" + urlparse(url).netloc
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        for element in soup.find_all(href=True):
            href_value = element['href']
            absolute_url = urljoin(base_url, href_value)
            if urlparse(absolute_url).netloc == urlparse(url).netloc:
                found_hrefs.add(absolute_url)

        new_hrefs = found_hrefs.difference(existing_hrefs)
        if len(new_hrefs) == 0:
            print("Found no new links")
            return existing_hrefs
        else:
            print("Found", len(new_hrefs), "new links")
            existing_hrefs = found_hrefs.union(existing_hrefs)
            for href in new_hrefs:
                return extract_links(href, existing_hrefs, max_depth, depth + 1)
    else:
        print(f"Failed to fetch the URL: {url}")
        return None

# Replace with the desired website URL
all_links = extract_links(website_url, set(), maxdepth=3)

if all_links:
    for link in all_links:
        print(link)

all_links = list(all_links)

# step 3: Classify links into articles or non articles
# use this prompt from ChatGPT:
PROMPT = '''I need you to act as a URL classifier. You are going to guess whether the given URL is an article based on the URL only.  Give me your best guess. If you believe the page is a written article, please output the URL with yes (like so: "[url]: yes"). If you think it contains a collection of articles, or the homepage of a blog, or anything that is NOT an article, output the url with no (like this: "[url]: no"). Do not respond with anything else except the URLs and the "yes" or "no".'''
NUM_LINKS_TO_PROCESS = 50

for i in range(len(all_links)):
    num_links_in_call = min(NUM_LINKS_TO_PROCESS, len(all_links) - i)
    included_links = all_links[i:i+num_links_in_call]
    included_links_string = ""
    for link in included_links:
        included_links_string += link
        included_links_string += " \n "

    # get openAI predictions
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"{PROMPT} \n \n {included_links_string}"},
            ]
    )
    
    

    print(response["choices"]["message"]["content"])

    i += num_links_in_call




# step 4: Parse data from HTML on website to get blog text
