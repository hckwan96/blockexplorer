import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTransactionReceipt, getBlock } from "../utils/alchemy";
import { WiTime9 } from "react-icons/wi";
import { PiGasPumpBold, PiCubeFill } from "react-icons/pi";
import { BsInfoCircle, BsFire } from "react-icons/bs";
import { Link } from "react-router-dom";
import { formatTimestamp, formatTimeAgo, formatNumber, reverseLookup } from "../utils/common"
import { ethers } from "ethers";
import { CopyToClip } from "../utils/copyToClip";
import ScrollToTopButton from "./ScrollToTopButton";

function Transaction() {
    const [txDetails, setTxDetails] = useState(
        <div className="py-4 pl-10 text-center">Loading...</div>
    );
    const { transHash } = useParams();
    const [ensNamesFrom, setEnsNamesFrom] = useState("");
    const [ensNamesTo, setEnsNamesTo] = useState("");

    let hasCopy = true;

    useEffect(() => {
        async function getTransaction() {
            const txnInfo = await getTransactionReceipt(transHash);
            const blockInfo = await getBlock(txnInfo.blockNumber);

            const baseFee = txnInfo.effectiveGasPrice && txnInfo.maxPriorityFeePerGas ? 
                ethers.utils.formatUnits(txnInfo.effectiveGasPrice, "gwei") - ethers.utils.formatUnits(txnInfo.maxPriorityFeePerGas, "gwei")
                : 0 ;
            const gasUsed = txnInfo.gasUsed;
            const Saving = txnInfo.effectiveGasPrice && txnInfo.maxPriorityFeePerGas ?  
                (ethers.utils.formatUnits(txnInfo.maxFeePerGas, "gwei") - ethers.utils.formatUnits(txnInfo.maxPriorityFeePerGas, "gwei") - baseFee) * gasUsed
                : 0;

            reverseLookup(txnInfo.from).then( ensName => setEnsNamesFrom(ensName));
            reverseLookup(txnInfo.to).then( ensName => setEnsNamesTo(ensName));

            setTxDetails(
                <div className=" bg-white mx-24 px-8 py-4 my-8 border rounded-lg divide-y">
                    <h1 className="pb-3 text-[#3498DA] font-bold">Overview</h1>
                    <div className="flex">
                        <div className="w-1/2 divide-y">
                            <TransactionInfoTitle title="Transaction Hash" />
                            <TransactionInfoTitle title="Block Number" />
                            <TransactionInfoTitle title="Time Stamp" />
                            <TransactionInfoTitle title="Block Hash" />
                            <TransactionInfoTitle title="From" />
                            <TransactionInfoTitle title="To" />
                            <TransactionInfoTitle title="Txn Fee" />
                            <TransactionInfoTitle title="Gas Limit & Usage by Txn" />
                            <TransactionInfoTitle title="Gas Price" />
                            <TransactionInfoTitle title="Gas Fees" />
                            <TransactionInfoTitle title="Burnt Fees" />
                            <TransactionInfoTitle title="Txn Savings Fee" />
                            <TransactionInfoTitle title="Txn Type" />
                            <TransactionInfoTitle title="Nonce" />
                            <TransactionInfoTitle title="Position In Block" />
                        </div>
                        <div className="divide-y w-full">
                            <p className="py-3">{txnInfo.transactionHash}</p>
                            <p className="py-3 text-[#357BAD]">
                                <Link to={`/block/${txnInfo.blockNumber}`}>
                                    {txnInfo.blockNumber}
                                </Link>
                                <span className="bg-gray-100 text-xs text-gray-500 p-2 ml-3 rounded-md">
                                    {txnInfo.confirmations} Block Confirmations
                                </span>
                            </p>
                            <p className="py-3">
                                {formatTimeAgo(blockInfo.timestamp)} ago ({formatTimestamp(blockInfo.timestamp)})
                            </p>
                            <p className="py-3 text-[#357BAD]">
                                <Link to={`/block/${txnInfo.blockHash}`}>
                                    {txnInfo.blockHash}
                                </Link>
                                {hasCopy && (
                                    <CopyToClip text={txnInfo.blockHash}  />
                                )}
                            </p>
                            <p className="py-3 text-[#357BAD]">
                                <Link to={`/address/${txnInfo.from}`}>
                                {
                                    ensNamesFrom ? 
                                        (<> <span title={`${txnInfo.from}`}>{ensNamesFrom}</span></>)
                                        : txnInfo.from
                                }
                                </Link>
                                {hasCopy && (
                                    <CopyToClip text={txnInfo.from}  />
                                )}
                            </p>
                            <p className="py-3 text-[#357BAD]">
                                <Link to={`/address/${txnInfo.to}`}>
                                {
                                    ensNamesTo ? 
                                    (<> <span title={`${txnInfo.to}`}>{ensNamesTo}</span></>) : txnInfo.to
                                }
                                </Link>
                                {hasCopy && (
                                    <CopyToClip text={txnInfo.to}  />
                                )}
                            </p>
                            <p className="py-3">
                                {formatNumber(ethers.utils.formatUnits(txnInfo.gasUsed * txnInfo.effectiveGasPrice, "gwei"))} Gwei
                                &nbsp; or &nbsp;
                                {formatNumber(ethers.utils.formatUnits(txnInfo.gasUsed * txnInfo.effectiveGasPrice, "ether"))} Ether
                            </p>
                            <p className="py-3">
                                {formatNumber(txnInfo.gasLimit)} Gwei &nbsp;|&nbsp; {formatNumber(txnInfo.gasUsed)} Gwei ( {(txnInfo.gasUsed/txnInfo.gasLimit * 100).toFixed(2) }%)
                            </p>
                            <p className="py-3">
                                {ethers.utils.formatUnits(txnInfo.effectiveGasPrice, "gwei")}  Gwei
                                &nbsp; or  &nbsp; 
                                {ethers.utils.formatUnits(txnInfo.effectiveGasPrice, "ether")}  Ether
                            </p>
                            <p className="py-3">
                                <span className="bg-gray-100 text-sm text-gray-500 p-2 rounded-sm">
                                    Base
                                </span>&nbsp;
                                { baseFee } Gwei&nbsp; | &nbsp;

                                <span className="bg-gray-100 text-sm text-gray-500 p-2 rounded-sm">
                                    Max
                                </span>&nbsp;
                                {
                                    txnInfo.maxFeePerGas ?
                                        ethers.utils.formatUnits(txnInfo.maxFeePerGas, "gwei")
                                        : 0
                                } Gwei&nbsp; | &nbsp;
                                <span className="bg-gray-100 text-sm text-gray-500 p-2 rounded-sm">
                                    Max Priorty
                                </span>&nbsp;
                                {
                                 txnInfo.maxPriorityFeePerGas ? 
                                    ethers.utils.formatUnits(txnInfo.maxPriorityFeePerGas, "gwei")
                                    : 0
                                } Gwei
                            </p>
                            <p className="py-3">
                                {formatNumber(baseFee * gasUsed)} Gwei 
                                &nbsp; or  &nbsp; 
                                {formatNumber(baseFee * gasUsed / 1000000000)} Ether
                            </p>
                            <p className="py-3">
                                {formatNumber(Saving)} Gwei 
                                &nbsp; or  &nbsp; 
                                {formatNumber(Saving / 1000000000)}  Ether
                            </p>
                            <p className="py-3">
                                { txnInfo.type ? 
                                    txnInfo.type === 2 ? (
                                        <span className="bg-gray-100 text-xs text-gray-500 p-2 rounded-sm">
                                            2 (EIP-1559)
                                        </span>
                                    ) : ""
                                    : "N/A"
                                 }
                            </p>
                            <p className="py-3">
                                { txnInfo.nonce}
                            </p>
                            <p className="py-3">
                                { txnInfo.transactionIndex}
                            </p>
                        </div>
                    </div>
                    
                    <ScrollToTopButton />
                </div>
            );
        }

        getTransaction();
    }, [transHash]);

    return txDetails;
}

function TransactionInfoTitle({ title }) {
    return (
        <div className="flex items-center">
            {title === "Time Stamp" ? (
                <WiTime9 size="20" />
            ) :
                title === "Gas Price" || title === "Gas Limit & Usage by Txn" || title === "Gas Fees" ?
                    (
                        <PiGasPumpBold />
                    )
                    :
                    title === "Burnt Fees" ?
                        (
                            <BsFire />
                        )
                        :
                        title === "Block Number" ?
                            (
                                <PiCubeFill />
                            ) :
                            (<BsInfoCircle />)
            }
            <p className="ml-2 py-3">{title}</p>
        </div>
    );
}


export default Transaction;
