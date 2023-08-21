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
    Radio
} from "@nextui-org/react";

import {withAuth} from "@/utils/withAuth"

import {
    doSignOut,
    getCurrentUser
} from "@/utils/firebase"

import { useState } from "react";

function App() {
    const [frequency, setFrequency] = useState("")

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    return(
        <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col mt-4 w-1/3 gap-10">
                
                <Card>
                    <CardBody>
                        <h1>User Info</h1>
                        <p>Your email is {getCurrentUser() ? getCurrentUser().email : 'unknown'}.</p>
                        <p>You're receiving emails <b>weekly</b> </p>
                        <Button
                            onClick={doSignOut}
                        >
                            Sign Out
                        </Button>
                        <Button>Change Frequency</Button>
                        <Button onPress={onOpen} color="primary">Open Modal</Button>
                        <Modal 
                            isOpen={isOpen} 
                            onOpenChange={onOpenChange}
                            placement="top-center"
                        >
                            <ModalContent>
                            {(onClose) => (
                                <>
                                <ModalHeader className="flex flex-col gap-1">Change Frequency of Emails</ModalHeader>
                                <ModalBody>
                                    <RadioGroup
                                        label="How often do you want to receive posts?"
                                        value={frequency}
                                        orientation="horizontal"
                                        defaultValue="weekly"
                                    >
                                        <Radio 
                                            value="daily"
                                            onChange={() => setFrequency("daily")}
                                        >
                                            Daily at 8am
                                        </Radio>
                                        <Radio 
                                            value="weekly"
                                            onChange={() => setFrequency("weekly")}
                                        >
                                            Mondays at 8am
                                        </Radio>
                                    </RadioGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="flat" onPress={onClose}>
                                    Close
                                    </Button>
                                    <Button color="primary" onPress={onClose}>
                                    Sign in
                                    </Button>
                                </ModalFooter>
                                </>
                            )}
                            </ModalContent>
                        </Modal>
                    </CardBody>
                </Card>
             </div>
        </div>
    )
}

export default withAuth(App)
