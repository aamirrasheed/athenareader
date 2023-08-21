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
    unsubscribeFromBlog
} from "@/utils/firebase"

import { useState } from "react";

const FAKE_BLOGS = [
    "paulgraham.com",
    "blog.samaltman.com",
    "markmanson.com",
    "waitbutwhy.com",
    "aamirrasheed.substack.com"
]

const FAKE_FREQUENCY = "weekly"

function App() {

    const [savedFrequency, setSavedFrequency] = useState(FAKE_FREQUENCY)
    const [formFrequency, setFormFrequency] = useState(FAKE_FREQUENCY)

    const [blogs, setBlogs] = useState(FAKE_BLOGS)
    const [blogToAdd, setBlogToAdd] = useState("")

    const {isOpen: isOpenFrequencyModal, onOpen: onOpenFrequencyModal, onOpenChange: onOpenChangeFrequencyModal} = useDisclosure();

    const {isOpen: isOpenAddBlogModal, onOpen: onOpenAddBlogModal, onOpenChange: onOpenChangeAddBlogModal} = useDisclosure();

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
                                            value="daily"
                                            onChange={() => setFormFrequency("daily")}
                                        >
                                            Daily at 8am
                                        </Radio>
                                        <Radio 
                                            value="weekly"
                                            onChange={() => setFormFrequency("weekly")}
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
                            onPress={onOpenAddBlogModal}
                            size="sm"
                            className="self-end"
                        >
                            Add Blog
                        </Button>
                        <Modal 
                            isOpen={isOpenAddBlogModal} 
                            onOpenChange={onOpenChangeAddBlogModal}
                            placement="top-center"
                        >
                            <ModalContent>
                            {(onClose) => (
                                <>
                                <ModalHeader className="flex flex-col gap-1">Add New Blog</ModalHeader>
                                <ModalBody>
                                    <Input
                                        label="Blog URL"
                                        value={blogToAdd}
                                        onChange={e => setBlogToAdd(e.target.value)}
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onPress={()=>{
                                        setBlogs([...blogs, blogToAdd])
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
                        {blogs.map(blog => (
                            <div key={blog}>
                            <div className="flex flex-row items-center justify-between">
                                <p>{blog}</p>
                                <Button 
                                    color="danger" 
                                    onPress={() => unsubscribeFromBlog(blog)}
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
