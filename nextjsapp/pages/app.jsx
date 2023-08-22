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
    Input
} from "@nextui-org/react";

import {withAuth} from "@/utils/withAuth"

import {
    doSignOut,
    getCurrentUser,
    unsubscribeFromWebsite
} from "@/utils/firebase"

import { useState } from "react";

import {FREQUENCY_CHOICES} from "@/utils/constants"

const FAKE_WEBSITES = [
    "paulgraham.com",
    "blog.samaltman.com",
    "markmanson.com",
    "waitbutwhy.com",
    "aamirrasheed.substack.com"
]

function App() {

    const [savedFrequency, setSavedFrequency] = useState("NOT LOADED")
    const [formFrequency, setFormFrequency] = useState("NEED TO LOAD")

    const [websites, setWebsites] = useState(FAKE_WEBSITES)
    const [websiteToAdd, setWebsiteToAdd] = useState("")

    const {isOpen: isOpenFrequencyModal, onOpen: onOpenFrequencyModal, onOpenChange: onOpenChangeFrequencyModal} = useDisclosure();

    const {isOpen: isOpenAddWebsiteModal, onOpen: onOpenAddWebsiteModal, onOpenChange: onOpenChangeAddWebsiteModal} = useDisclosure();

    return(
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col mt-4 w-1/3 gap-10">
                <Card>
                    <CardHeader>
                        <p className="text-2xl">User Info</p>
                    </CardHeader>
                    <Divider/>
                    <CardBody>
                        <p>Your email is {getCurrentUser() ? getCurrentUser().email : 'unknown'}.</p>
                        <p>You're receiving emails <b>{savedFrequency}</b>.</p>
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
                                        value={formFrequency}
                                        orientation="horizontal"
                                        defaultValue={savedFrequency}
                                    >
                                        <Radio 
                                            value={FREQUENCY_CHOICES.daily}
                                            onChange={() => setFormFrequency(FREQUENCY_CHOICES.daily)}
                                        >
                                            Daily at 8am
                                        </Radio>
                                        <Radio 
                                            value={FREQUENCY_CHOICES.weekly}
                                            onChange={() => setFormFrequency(FREQUENCY_CHOICES)}
                                        >
                                            Mondays at 8am
                                        </Radio>
                                    </RadioGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onPress={()=>{
                                        setSavedFrequency(formFrequency)
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
                                        value={websiteToAdd}
                                        onChange={e => setWebsiteToAdd(e.target.value)}
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onPress={()=>{
                                        setWebsites([...websites, websiteToAdd])
                                        onClose()
                                    }}>
                                        Save 
                                    </Button>
                                </ModalFooter>
                                </>
                            )}
                            </ModalContent>
                        </Modal>
                    </CardHeader>
                    <Divider/>
                    <CardBody>
                        {websites.map(website => (
                            <div key={website}>
                            <div className="flex flex-row items-center justify-between">
                                <p>{website}</p>
                                <Button 
                                    color="danger" 
                                    onPress={() => unsubscribeFromWebsite(website)}
                                    size="sm"
                                >
                                    Unsubscribe
                                </Button>
                            </div>
                            <Spacer y={2}/>
                            <Divider/>
                            <Spacer y={2}/>
                            </div>
                        ))}
                    </CardBody>
                </Card>
             </div>
        </div>
    )
}

export default withAuth(App)
