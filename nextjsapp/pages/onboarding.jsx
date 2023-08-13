import { 
    Input,
    Radio,
    RadioGroup,
    Card,
    CardBody,
    Spacer,
    Button,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import validator from 'validator';


export default function Onboarding () {
    const router = useRouter();
    
    // input state
    const [formData, setFormData] = useState({
        url: '',
        frequency: '',
        email: '',
    });
    
    // validation state
    const [formErrors, setFormErrors] = useState({
        urlError: '',
        frequencyError: '',
        emailError: ''
    })
    
    // Get and load the URL query params when page loads
    useEffect(() => {
        if(router.query.url) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                url: router.query.url,
            }))
        }
    }, [router.query.url])
    
    // form validation logic
    const validateForm = () => {
        const errors = {};
        
        if (!formData.url) {
            errors.urlError = 'URL required';
        }

        if(!validator.isURL(formData.url)){
            errors.urlError = "Invalid URL";
        }
        
        if (!formData.frequency) {
            errors.frequencyError = 'Choose a frequency';
        }
        
        if (!formData.email) {
            errors.emailError = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.emailError = 'Invalid email address';
        }
        
        return errors;
    };

    const handleSubmit = (e) => {
        const errors = validateForm();
        if(Object.keys(errors).length === 0){
            console.log("Form successful")
        } else{
            setFormErrors((prevFormErrors) => ({
                ...prevFormErrors,
                ...errors
            }));
        }
    }
    
    // event handlers
    const handleUrlChange = (e) => {
        setFormErrors((prevFormErrors) => ({
            ...prevFormErrors,
            urlError: ""
        }))
        setFormData((prevFormData) => ({
            ...prevFormData,
            url: e.target.value,
        }))
    }
    const handleFrequencyChange = (e) => {
        setFormErrors((prevFormErrors) => ({
            ...prevFormErrors,
            frequencyError: ""
        }))
        setFormData((prevFormData) => ({
            ...prevFormData,
            frequency: e.target.value,
        }))
    }
    const handleEmailChange = (e) => {
        setFormErrors((prevFormErrors) => ({
            ...prevFormErrors,
            emailError: ""
        }))
        setFormData((prevFormData) => ({
            ...prevFormData,
            email: e.target.value,
        }))
    }
    
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col mt-4 w-1/3 gap-10">
                <Card>
                    <CardBody>
                        <Input
                            isRequired
                            label="URL"
                            value={formData.url}
                            onChange={handleUrlChange}
                            validationState={formErrors.urlError === "" ? "valid" : "invalid"}
                            errorMessage={formErrors.urlError}
                        />
                        <Spacer y={6}/>
                        <RadioGroup
                            label="How often do you want to receive posts?"
                            value={formData.frequency}
                            orientation="horizontal"
                            validationState={formErrors.frequencyError === "" ? "valid" : "invalid"}
                            errorMessage={formErrors.frequencyError}
                            defaultValue="weekly"
                        >
                            <Radio 
                                value="daily"
                                onChange={handleFrequencyChange}
                            >
                                Daily at 8am
                            </Radio>
                            <Radio 
                                value="weekly"
                                onChange={handleFrequencyChange}
                            >
                                Mondays at 8am
                            </Radio>
                        </RadioGroup>
                        <Spacer y={6}/>
                        <Input 
                            isRequired
                            label="Email"
                            value={formData.email}
                            onChange={handleEmailChange}
                            validationState={formErrors.emailError === "" ? "valid" : "invalid"}
                            errorMessage={formErrors.emailError}
                        />
                        <Spacer y={6}/>
                        <Button
                            onClick={handleSubmit}
                            >
                            Submit
                        </Button>
                    </CardBody>
                </Card>
            </div>
        </div>
        )
    }