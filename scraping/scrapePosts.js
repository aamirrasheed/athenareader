
const axios = require('axios');
const { JSDOM } = require('jsdom');
const Openai = require('openai');
const openai = new Openai(process.env.OPENAI_API_KEY);
const url = require('url');

async function getProtocol(url) {
    try {
        await axios.get('https://' + url);
        return 'https://';
    } catch (error) {
        return 'http://';
    }
}
async function extractTextContent(url) {
    // Fetch the HTML
    const response = await axios.get(url);
    const html = response.data;
  
    // Parse the HTML and extract the text content
    const dom = new JSDOM(html);
    const textContent = dom.window.document.body.textContent;
  
    return textContent;
  }

async function scrapeWebsiteContent(urlToVisit, existing_hrefs, max_depth=10, depth=0) {
    if(depth === max_depth){
        return existing_hrefs;
    }

    let found_hrefs = {};

    let response = await axios.get(urlToVisit);
    
    let base_url = new URL(urlToVisit).protocol + "//" + new URL(urlToVisit).hostname;

    if (response.status === 200) {
        const dom = new JSDOM(response.data);

        let elements = dom.window.document.querySelectorAll('[href]');
        elements.forEach(async (element) => {
            let href_value = element.getAttribute('href');
            let absolute_url = url.resolve(base_url, href_value);
            if (new URL(absolute_url).hostname === new URL(urlToVisit).hostname) {
                found_hrefs[absolute_url] = await extractTextContent(absolute_url);
                
            }
        });

        // check if we found any new links
        let new_hrefs = Object.keys(found_hrefs).filter(x => !existing_hrefs.hasOwnProperty(x));

        if (new_hrefs.length === 0) {
            // skip visiting links if no new links found
            return existing_hrefs;
        } 
        else {
            // new links found - recurse
            existing_hrefs = {...found_hrefs, ...existing_hrefs};
            for (let href of new_hrefs) {
                return await scrapeWebsiteContent(href, existing_hrefs, max_depth, depth + 1);
            }
        }
    } else {
        console.log(`Failed to fetch the URL: ${urlToVisit}`);
        return null;
    }
}

async function main() {
    // step 1: Get the website URL
    const website_url = "paulgraham.com";

    // step 2: define function that recursively scrapes posts to certain depth
    async function extract_links(urlToVisit, existing_hrefs, max_depth=10, depth=0) {
        if(depth === max_depth){
            return existing_hrefs;
        }

        let found_hrefs = new Set();

        let response = await axios.get(urlToVisit);
        
        let base_url = new URL(urlToVisit).protocol + "//" + new URL(urlToVisit).hostname;

        if (response.status === 200) {
            const dom = new JSDOM(response.data);

            let elements = dom.window.document.querySelectorAll('[href]');
            elements.forEach((element) => {
                let href_value = element.getAttribute('href');
                let absolute_url = url.resolve(base_url, href_value);
                if (new URL(absolute_url).hostname === new URL(urlToVisit).hostname) {
                    found_hrefs.add(absolute_url);
                }
            });

            // check if we found any new links
            let new_hrefs = new Set([...found_hrefs].filter(x => !existing_hrefs.has(x)));

            if (new_hrefs.size === 0) {
                // skip visiting links if no new links found
                return existing_hrefs;
            } 
            else {
                // new links found - recurse
                existing_hrefs = new Set([...found_hrefs, ...existing_hrefs]);
                for (let href of new_hrefs) {
                    return await extract_links(href, existing_hrefs, max_depth, depth + 1);
                }
            }
        } else {
            console.log(`Failed to fetch the URL: ${urlToVisit}`);
            return null;
        }
    }

    // step 3: get valid URL
    let valid_url;
    if (website_url.includes('://')) {
        valid_url = website_url;
    } else {
        let protocol = await getProtocol(website_url);
        valid_url = protocol + website_url;
    }

    // step 4: scrape website
    console.log("Calling scrapeWebsiteContent on ", valid_url)
    let all_posts = await scrapeWebsiteContent(valid_url, new Set(), 5);

    console.log("Found", Object.keys(all_posts).length, "posts")
    // step 5: write to disk
    const fs = require('fs');
    fs.writeFileSync('paulgraham_com.json', JSON.stringify(all_posts));






    // use this prompt from ChatGPT:
    // const PROMPT = `I need you to act as a URL classifier. You are going to guess whether the given URL is an article based on the URL only.  Give me your best guess. If you believe the page is a written article, please output the URL with yes (like so: "[url]: yes"). If you think it contains a collection of articles, or the homepage of a blog, or anything that is NOT an article, output the url with no (like this: "[url]: no"). Do not respond with anything else except the URLs and the "yes" or "no".`;
    // const NUM_LINKS_TO_PROCESS = 50;

    // for (let i = 0; i < all_links.length; i += NUM_LINKS_TO_PROCESS) {
    //     let num_links_in_call = Math.min(NUM_LINKS_TO_PROCESS, all_links.length - i);
    //     let included_links = all_links.slice(i, i + num_links_in_call);
    //     let included_links_string = included_links.join(" \n ");

    //     // get openAI predictions
    //     let response = await openai.chat.completions.create({
    //         model: "gpt-3.5-turbo",
    //         messages: [
    //             {"role": "system", "content": "You are a helpful assistant."},
    //             {"role": "user", "content": `${PROMPT} \n \n ${included_links_string}`},
    //         ]
    //     });

    //     console.log(response.choices[0].message.content);
    // }
}
main()
