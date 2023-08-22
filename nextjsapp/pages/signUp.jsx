import { 
    Input,
    Radio,
    RadioGroup,
    Card,
    CardBody,
    Spacer,
    Button,
} from "@nextui-org/react";
import { useState } from "react";

import validator from 'validator'

import {
    doSendSignInLinkToEmail,
    doCheckIfUserExists
} from '@/utils/firebase'

import {FREQUENCY_CHOICES} from '@/utils/constants'

const INITIAL_FORM_STATE = {
    email: "",
    frequency: FREQUENCY_CHOICES.daily
}
const EMAIL_ERROR_MSG = "Invalid Email"


export default function SignUp () {
    const [formData, setFormData] = useState({...INITIAL_FORM_STATE})

    const [formErrors, setFormErrors] = useState({...INITIAL_FORM_STATE})

    const [emailSent, setEmailSent] = useState(false)

    const shallowEquals = (obj1, obj2) => 
        (Object.keys(obj1).length === Object.keys(obj2).length) &&
         Object.keys(obj1).every(key =>
            obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
         )
    
    // send off authentication link to user!
    const handleSubmit = (e) => {
        doCheckIfUserExists(formData.email).then((exists) => {
            if(exists){
                // user already exists, so we don't want to tell them
                setEmailSent(true)
                return
            }
            else {
                // user dosen't exist yet
                return doSendSignInLinkToEmail(formData.email, {
                    url: `${window.location.origin}/finishLogin?signUp=true&frequency=${formData.frequency}`,
                    handleCodeInApp: true
                })
            }
        })
        .then(() => {
            // The link was successfully sent. 
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            window.localStorage.setItem('emailForSignIn', formData.email);
            setEmailSent(true)
        })
        .catch((error) => {
            console.log("Error Code: " + error.code)
            console.log("Error Message: " + error.message)
            let errorMessage = "Email sign up link didn't work. Check console"
            setFormErrors({
                frequency: errorMessage,
                email: errorMessage
            })
        });
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col mt-4 w-1/3 gap-10">
                <Card>
                    <CardBody>
                        { emailSent ? <h1>If this account doesn't already exist, we've sent you an email to log in!</h1> :
                            <>
                                <h1>Sign up for an account!</h1>
                                <Spacer y={4}/>
                                <Input 
                                    isRequired
                                    label="Email"
                                    value={formData?.email}
                                    onChange={e => {
                                        setFormData({...formData, email: e.target.value})
                                        if (validator.isEmail(e.target.value)) setFormErrors({...formData, email: ""})
                                        else setFormErrors({...formData, email: EMAIL_ERROR_MSG})
                                    }}
                                    validationState={formErrors.email === "" ? "valid" : "invalid"}
                                    errorMessage={formErrors.email}
                                />
                                <Spacer y={6}/>
                                <RadioGroup
                                    isRequired
                                    label="How often do you want to receive posts?"
                                    orientation="horizontal"
                                    value={formData.frequency}
                                    defaultValue={FREQUENCY_CHOICES.daily}
                                >
                                    <Radio 
                                        value={FREQUENCY_CHOICES.daily}
                                        onChange={e => setFormData({...formData, frequency: e.target.value})}
                                    >
                                        Daily at 8am
                                    </Radio>
                                    <Radio 
                                        value={FREQUENCY_CHOICES.weekly}
                                        onChange={e => setFormData({...formData, frequency: e.target.value})}
                                    >
                                        Mondays at 8am
                                    </Radio>
                                </RadioGroup>
                                <Spacer y={6}/>
                                <Button
                                    onClick={handleSubmit}
                                    isDisabled={shallowEquals(formData, INITIAL_FORM_STATE) || !shallowEquals(formErrors, INITIAL_FORM_STATE)}
                                >
                                    Create an account
                                </Button>
                            </>
                        }
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}