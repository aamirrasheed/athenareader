import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Card,
    CardBody,
    RadioGroup,
    Radio,
    Spacer,
    CardHeader,
    Divider,
    Input,
    Spinner
} from "@nextui-org/react";

import {withAuth} from "@/utils/withAuth"
import {
    encodeWebsiteURL,
    decodeWebsiteURL,
    extractSchemeAndHost
} from "@/utils/websiteNameConversion"

import {
    doSignOut,
    authUser,
    user,
    doSetUserFrequency,
    doSubscribeUserToWebsite,
    doUnsubscribeUserFromWebsite,
} from "@/utils/firebase"

import {
    get,
    onValue
} from "firebase/database"

import { useState, useEffect } from "react";

import {FREQUENCY_CHOICES} from "@/utils/constants"

const FAKE_WEBSITES = [
    "paulgraham.com",
    "blog.samaltman.com",
    "markmanson.com",
    "waitbutwhy.com",
    "aamirrasheed.substack.com"
]

function App() {
    const [loading, setLoading] = useState(true)

    const [userFrequency, setUserFrequency] = useState("NOT LOADED")
    const [formFrequency, setFormFrequency] = useState("NOT LOADED")

    const [userWebsites, setUserWebsites] = useState(FAKE_WEBSITES)
    const [formWebsite, setFormWebsite] = useState("")
    const [formWebsiteError, setFormWebsiteError] = useState(null)
    const [formWebsiteLoading, setFormWebsiteLoading] = useState(false)

    const {isOpen: isOpenFrequencyModal, onOpen: onOpenFrequencyModal, onOpenChange: onOpenChangeFrequencyModal} = useDisclosure();

    const {isOpen: isOpenAddWebsiteModal, onOpen: onOpenAddWebsiteModal, onOpenChange: onOpenChangeAddWebsiteModal} = useDisclosure();

    const handleFormWebsiteSubmit = (onClose) => {
        setFormWebsiteLoading(true)
        if(userWebsites.includes(formWebsite)) {
            setFormWebsiteError("Website already exists")
        } else {
        
            doSubscribeUserToWebsite(formWebsite)
            .then(() => {
                setFormWebsite("")
                onClose()
            })
            .catch((error) => {
                setFormWebsiteError(error.message)
            })
            .finally(() => {
                setFormWebsiteLoading(false)
            })
        }
    }
    
    // load the user data from firebase
    useEffect(() => {
        onValue(user(authUser().uid), (snapshot) => {
            const data = snapshot.val()
            if(data){
                setUserFrequency(data.frequency ? data.frequency : null)
                setFormFrequency(data.frequency ? data.frequency : null)
                setUserWebsites(data.subscriptions ? 
                    Object.keys(data.subscriptions).map((encoded) => decodeWebsiteURL(encoded)) : [])
                setLoading(false)
            }
        })
    }, [])

    return(
        <div className="flex flex-col items-center justify-center">
            {loading ? <Spinner/> : 
                <div className="flex flex-col mt-4 w-1/3 gap-10">
                    <Card>
                        <CardHeader>
                            <p className="text-2xl">User Info</p>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <p>Your email is {authUser() ? authUser().email : 'unknown'}.</p>
                            <p>You're receiving emails <b>{userFrequency}</b>.</p>
                            <Spacer y={4}/>
                            <Button
                                onClick={doSignOut}
                            >
                                Sign Out
                            </Button>
                            <Spacer y={4}/>
                            <Button onPress={onOpenFrequencyModal} color="secondary">Change Email Frequency</Button>
                            <Modal 
                                isOpen={isOpenFrequencyModal} 
                                onOpenChange={onOpenChangeFrequencyModal}
                                placement="top-center"
                            >
                                <ModalContent>
                                {(onClose) => (
                                    <>
                                    <ModalHeader className="flex flex-col gap-1">Change Frequency of Emails</ModalHeader>
                                    <ModalBody>
                                        <RadioGroup
                                            label="How often do you want to receive posts?"
                                            value={userFrequency}
                                            orientation="horizontal"
                                            defaultValue={userFrequency}
                                        >
                                            <Radio 
                                                value={FREQUENCY_CHOICES.daily}
                                                onChange={() => setUserFrequency(FREQUENCY_CHOICES.daily)}
                                            >
                                                Daily at 8am
                                            </Radio>
                                            <Radio 
                                                value={FREQUENCY_CHOICES.weekly}
                                                onChange={() => setUserFrequency(FREQUENCY_CHOICES.weekly)}
                                            >
                                                Mondays at 8am
                                            </Radio>
                                        </RadioGroup>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" onPress={()=>{
                                            doSetUserFrequency(authUser().uid, formFrequency)
                                            setUserFrequency(formFrequency)
                                            onClose()
                                        }}>
                                            Save 
                                        </Button>
                                    </ModalFooter>
                                    </>
                                )}
                                </ModalContent>
                            </Modal>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader className="justify-between">
                            <p className="text-2xl self-start">Subscriptions</p>
                            <Button
                                color="secondary"
                                onPress={onOpenAddWebsiteModal}
                                size="sm"
                                className="self-end"
                            >
                                Add Website
                            </Button>
                            <Modal 
                                isOpen={isOpenAddWebsiteModal} 
                                onOpenChange={onOpenChangeAddWebsiteModal}
                                placement="top-center"
                            >
                                <ModalContent>
                                {(onClose) => (
                                    <>
                                    <ModalHeader className="flex flex-col gap-1">Add New Website</ModalHeader>
                                    <ModalBody>
                                        <Input
                                            label="Website URL"
                                            value={formWebsite}
                                            errorMessage={formWebsiteError}
                                            disabled={formWebsiteLoading}
                                            onChange={e => {
                                                setFormWebsite(e.target.value)
                                                setFormWebsiteError(null)
                                            }}
                                            onKeyDown={e => e.key === 'Enter' ? handleFormWebsiteSubmit(onClose): null}
                                        />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button 
                                            color="primary" 
                                            onPress={(e) => handleFormWebsiteSubmit(onClose)}
                                            isLoading={formWebsiteLoading}
                                        >
                                            {formWebsiteLoading ? "" : "Save"}
                                        </Button>
                                    </ModalFooter>
                                    </>
                                )}
                                </ModalContent>
                            </Modal>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            {userWebsites ? userWebsites.map(website => (
                                <div key={website}>
                                <div className="flex flex-row items-center justify-between">
                                    <p>{website}</p>
                                    <Button 
                                        color="danger" 
                                        onPress={() => doUnsubscribeUserFromWebsite(authUser().uid, website)}
                                        size="sm"
                                    >
                                        Unsubscribe
                                    </Button>
                                </div>
                                <Spacer y={2}/>
                                <Divider/>
                                <Spacer y={2}/>
                                </div>
                            )): null}
                        </CardBody>
                    </Card>
                </div>
            }
        </div>
    )
}

export default withAuth(App)
