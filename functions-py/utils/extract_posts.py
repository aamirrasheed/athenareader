import openai
from bs4 import BeautifulSoup
import requests
from urllib.parse import urlparse, urljoin
import tiktoken
import json
import re
from . import prompts

def scrape_website(website_url, depth_to_scrape=2):
    print("Scraping", website_url, "with depth", depth_to_scrape, "...")
    posts = {}
    def extract_links(url, existing_hrefs=set(), max_depth=4, depth=0):
        
        base_url = urlparse(url).scheme + "://" + urlparse(url).netloc
        response = requests.get(url)
        
        if response.status_code == 200:
            # valid url, add to existing_hrefs
            existing_hrefs.add(url)

            # get page content and save to posts for classification later on
            soup = BeautifulSoup(response.content, 'html.parser')
            posts[url] = soup.get_text()

            if(depth == max_depth):
                return existing_hrefs

            # get links inside the page soup
            found_hrefs = set()
            for element in soup.find_all(href=True):
                href_value = element['href']
                
                # if href_value is relative, make it absolute. If it's an external link, it will be unchanged
                absolute_url = urljoin(base_url, href_value)

                # only add links from same domain
                if urlparse(absolute_url).netloc == urlparse(url).netloc:
                    found_hrefs.add(absolute_url)
            

            # determine which links are new from this page
            new_hrefs = found_hrefs.difference(existing_hrefs)

            # if there are new links, explore them to determine if more links exist
            if len(new_hrefs) > 0:

                # update existing_hrefs with new_hrefs so we don't explore new_hrefs in any subsequent recursive calls
                existing_hrefs = existing_hrefs.union(new_hrefs)

                # for each link in new_hrefs, let's recurisvely explore it to see if there are more pages to find
                for href in new_hrefs:
                    new_existing_hrefs = extract_links(href, existing_hrefs, max_depth, depth + 1)

                    # add any new links found in the recursive call to the existing_hrefs set
                    existing_hrefs = existing_hrefs.union(new_existing_hrefs)
                
        else:
            # Invalid URL, so remove the URL from the list of links to scrape
            existing_hrefs.remove(url)
        
        # return all the links we found
        return existing_hrefs

    return posts, extract_links(website_url, max_depth=depth_to_scrape) 

def classify_page(url, body):
    print("classify_page called with url:", url)
    prompt = prompts.BLOGPOST_CLASSIFICATION_AND_EXTRACT_TITLE_DATE
    enc = tiktoken.encoding_for_model("gpt-3.5-turbo") 

    # Limit the number of tokens for input to OpenAI
    num_tokens = len(enc.encode(body + prompt + url))
    if num_tokens > 1000:
        num_other_tokens = len(enc.encode(prompt + url))
        body = enc.decode(enc.encode(body)[:1000 - num_other_tokens])

    # get the chatGPT response
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"{prompt} \n \n URL: {url} \n Body: {body}"},
            ]
    )
    classification = response["choices"][0]["message"]["content"]

    try:
        return json.loads(classification)
    except:
        # sometimes, chatGPT adds extra unnecessary words around the JSON response. This should catch that.
        match = re.search(r'\{.*\}', classification)
        if match:
            return json.loads(match.group())
        else:
            raise ValueError(f"Unable to parse chatGPT response. The following: \n \n {classification} \n \n is not JSON")
    

def encode_url(url):
    url = url.replace(":", '%AA')
    url = url.replace(".", '%AB')
    url = url.replace("$", '%AC')
    url = url.replace("[", '%AD')
    url = url.replace("]", '%AE')
    url = url.replace("#", '%AF')
    url = url.replace("/", '%AG')
    return url

def decode_url(url):
    url = url.replace('%AG', "/")
    url = url.replace('%AF', "#")
    url = url.replace('%AE', "]")
    url = url.replace('%AD', "[")
    url = url.replace('%AC', "$")
    url = url.replace('%AB', ".")
    url = url.replace('%AA', ":")
    return url
    




