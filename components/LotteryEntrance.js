import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entrancefee, setEntranceFee] = useState("0")
    const [numPlayer, setNumPlayer] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    //make entranceFee from normal variable to a hook
    //entrancefee: the variable we call to get the entrance fee
    //entrancefee: the function we call to update or set that entrance fee
    //here useState tell us where the entrancefee is going to start which is 0

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specific network Id
        functionName: "enterRaffle",
        params: {},
        msgValue: entrancefee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specific network Id
        functionName: "enterRaffle",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specific network Id
        functionName: "getNumberOfPlayers",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayerFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayer(numPlayerFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            //try to read the raffle entrance fee
            updateUI()
        }
    }, [isWeb3Enabled])

    // no list means it'll update everytime anything changes or happens
    // empty list means it'll run once after the initial rendering
    // and dependencies mean it'll run whenever those things in the list change

    // An example filter for listening for events, we will learn more on this next Front end lesson
    // const filter = {
    //     address: raffleAddress,
    //     topics: [
    //         // the name of the event, parnetheses containing the data type of each event, no spaces
    //         utils.id("RaffleEnter(address)"),
    //     ],
    // }

    /**-------------------------------------------------------- */

    /** Notification: to let the user know you have submitted the transactiion
     * for the notification => upon clicking the button if tx is succesful
     *                         it calls handleSucces fn.
     *
     * Created handleSucces fn :
     * 1. called when the enter raffle tx is successfull
     * 2. the function waits for that rx to complete
     *     and then calls handleNewNotification fn
     *
     * HandleNewNotification fn:
     * 1. dispatches the notification on the screen
     *
     */
    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction complete!",
            title: "Tx Notifiction",
            position: "topR",
            icon: "bell",
        })
    }

    /**-------------------------------------------------------- */

    /**In return:
     * 1. first we will check if there is any entry or not
     *    meaning we will check the raffle address
     * 2. Then we created a button to enter the Raffle
     *     Here we are connecting the backend through the button
     * 3. We are displaying the Entrance Fee of the lottery in eth
     */

    return (
        <div>
            Hi from Lottery entrance!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 round ml-auto"
                        onClick={async function () {
                            //when this enterRaffle fn. is successful , we will do handle success
                            await enterRaffle({
                                //onComplete
                                //onError
                                //onSuccess checks to see a transaction is successful on metamask
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                                //Note: Always use this onError for any run contract functions, even for the reads,
                                //      If any of my contract function breaks , I will get to know by this
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>
                        Entrance Fee: {ethers.utils.formatUnits(entrancefee, "ether")} ETH Number
                        of
                    </div>
                    <div>Players:{numPlayer}</div>
                    <div>Recent Winner:{recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle address detected</div>
            )}
        </div>
    )
}
