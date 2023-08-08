'use client'


import { Input } from "@nextui-org/input";
import { useState } from "react";

export const UrlForm = () => {
    const [inputValue, setInputValue] = useState("")
    
    const handleKeyDown = async (e) => {
        
        if (e.key === 'Enter' && inputValue !== "") {
            e.preventDefault()
            // TODO: Validate URL format
            
            const JSONdata = JSON.stringify(inputValue)
            
            // API endpoint where we send form data.
            const endpoint = '/api/scrapeWebsite'
            
            // Form the request for sending data to the server.
            const options = {
                // The method is POST because we are sending data.
                method: 'POST',
                // Tell the server we're sending JSON.
                headers: {
                    'Content-Type': 'application/json',
                },
                // Body of the request is the JSON data we created above.
                body: JSONdata,
            }
            
            // Send the form data to our forms API on Vercel and get a response.
            const response = await fetch(endpoint, options)
            // Handle the input value after Enter is pressed
            console.log('Entered value:', inputValue);
        }
    }
    
    const handleInputChange = (e) => {
        setInputValue(e.target.value)
    }
    
    return (
        <>
            <Input
                placeholder="Enter the URL of your favorite blog..."
                className="w-full"
                name="url"
                id="url"
                isClearable={false}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
        </>
        )
    }