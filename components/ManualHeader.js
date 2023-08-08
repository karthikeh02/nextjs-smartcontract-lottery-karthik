import Moralis from "moralis"
import { useEffect } from "react"
import { useMoralis } from "react-moralis"

// Top navbar
export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis() //react-hook

    //my frontend should render according to the wallet connection status
    //hooks are a way to work with status , automatically renders the app

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])
    //it runs twice because of strict mode
    //if no dependecy array -- it runs anytime smething re-renders , you can get circular render
    // blank dependecy array - run once on load
    // dependecies in array - run anytime something in there changes

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log("Account changed to ${account}")
            if (account == null) {
                //we can assume disconnected
                window.localStorage.removeItem("connected")
                deactivateWeb3()
            }
        })
    }, [])

    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "inject")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
