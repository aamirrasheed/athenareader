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
    Spacer,
    CardHeader,
    Divider,
    Input,
    Spinner
} from "@nextui-org/react";

import {withAuth} from "@/utils/withAuth"

import {
    doSignOut,
    authUser,
    user,
    doSubscribeUserToWebsite,
    doUnsubscribeUserFromWebsite,
} from "@/utils/firebase"

import {
    onValue
} from "firebase/database"

import { useState, useEffect } from "react";

function App() {
    const [loading, setLoading] = useState(true)

    const [userWebsites, setUserWebsites] = useState([])
    const [userWebsitesUnsubscribeLoading, setUserWebsitesUnsubscribeLoading] = useState({})

    const [formWebsite, setFormWebsite] = useState("")
    const [formWebsiteError, setFormWebsiteError] = useState(null)
    const [formWebsiteLoading, setFormWebsiteLoading] = useState(false)


    const {isOpen: isOpenAddWebsiteModal, onOpen: onOpenAddWebsiteModal, onOpenChange: onOpenChangeAddWebsiteModal, onClose: onCloseAddWebsiteModal} = useDisclosure();

    const handleFormWebsiteSubmit = (onClose, e) => {
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
                console.log("Error when calling doSubscribeUserToWebsite:", error)
                setFormWebsiteError("That seems to be an invalid URL. Try copy pasting the entire URL from the browser. Example: http://paulgraham.com/")
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
                setUserWebsites(data.subscriptions ? Object.values(data.subscriptions) : [])
                setUserWebsitesUnsubscribeLoading(data.subscriptions ? Object.values(data.subscriptions) : {})
                setUserWebsitesUnsubscribeLoading(data.subscriptions ? Object.fromEntries(Object.values(data.subscriptions).map(website => [website, false])) : {})
                setLoading(false)
            }
            else{
                setLoading(false)
                console.log("Unable to find user with uid:", authUser().uid)
            }
        })
    }, [])

    return(
        <div className="flex flex-col items-center justify-center">
            {loading ? <Spinner/> : 
                <div className="flex flex-col mt-4 w-full md:w-1/2 lg:w-1/3 gap-10">
                    <Card>
                        <CardHeader>
                            <p className="text-2xl">User Info</p>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <p>Your email is {authUser() ? authUser().email : 'unknown'}.</p>
                            <p>You'll be receiving your digest each morning at 8AM.</p>
                            <Spacer y={4}/>
                            <Button
                                onClick={doSignOut}
                            >
                                Sign Out
                            </Button>
                            <Spacer y={4}/>
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
                                onClose={() => {
                                    onCloseAddWebsiteModal()
                                    setFormWebsite("")
                                    setFormWebsiteError(null)
                                }}
                                placement="top-center"
                            >
                                <ModalContent>
                                {(onClose) => (
                                    <>
                                    <ModalHeader className="flex flex-col gap-1">Add New Website</ModalHeader>
                                    <ModalBody>
                                        <Input
                                            autoFocus
                                            label="Website URL"
                                            value={formWebsite}
                                            errorMessage={formWebsiteError}
                                            disabled={formWebsiteLoading}
                                            onChange={e => {
                                                setFormWebsite(e.target.value)
                                                setFormWebsiteError(null)
                                            }}
                                        />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button 
                                            color="primary" 
                                            onPress={e => {
                                                handleFormWebsiteSubmit(onClose)
                                            }}
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
                                        name={website}
                                        color="danger" 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setUserWebsitesUnsubscribeLoading({...userWebsitesUnsubscribeLoading, [website]: true})
                                            doUnsubscribeUserFromWebsite(website).then(() => {
                                                setUserWebsitesUnsubscribeLoading({...userWebsitesUnsubscribeLoading, [website]: false})
                                            })
                                            setUserWebsites(userWebsites.filter(item => item !== website))
                                        }}
                                        isLoading={userWebsitesUnsubscribeLoading[website]}
                                        size="sm"
                                    >
                                        {userWebsitesUnsubscribeLoading[website] ? "": "Unsubscribe"}
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
