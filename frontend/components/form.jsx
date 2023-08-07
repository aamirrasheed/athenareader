'use client'


import { Input } from "@nextui-org/input";
import { useState } from "react";

export const EnterURLForm = () => {
    const [inputValue, setInputValue] = useState()

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
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
                placeholder="Enter a URL..."
                className="w-full"
                name="url"
                id="url"
                isClearable={false}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
        </>
    )
}