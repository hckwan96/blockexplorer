import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom"; 
import { getBlock, getBlockReward, getLatestBlockNumber } from "../utils/alchemy";
import { BsInfoCircle, BsFire } from "react-icons/bs";
import { WiTime9 } from "react-icons/wi";
import { ethers } from "ethers";
import { PiGasPumpBold, PiCubeFill, PiMoney, PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { formatTimestamp, formatTimeAgo, formatNumber, reverseLookup } from "../utils/common";
import { CopyToClip } from "../utils/copyToClip";
import ScrollToTopButton from "./ScrollToTopButton";

function Block() {
    let { blockNumber } = useParams();
    const navigate = useNavigate(); 
    const [blockInfo, setBlockInfo] = useState();
    const [latestBlock, setLatestBlock] = useState("");
    const [rewardCalculated, setRewardCalculated] = useState(false);
    const [sumMinerTips, setSumMinerTips] = useState(0);
    const [blockReward, setBlockReward] = useState(0);
    const [baseBlockReward, setBaseBlockReward] = useState(0);
    const [burnedFee, setBurnedFee] = useState(0);
    const [totalNephewReward, setTotalNephewReward] = useState(0);
    const [recipient, setRecipient] = useState(null);

    const isBlockNumber = (block) => {
        return !String(block).startsWith("0x") && !isNaN(Number(block)); 
    };
    
    const handleNextBlock = (block) => {
        navigate(`/block/${block}`);
    };

    const handlePreviousBlock = (block) => {
        const prevBlock = Math.max(1, block);
        navigate(`/block/${prevBlock}`);
    };

    useEffect(() => {
        let mounted = true;
    
        (async () => {
          const fetchedLatestBlock = await getLatestBlockNumber();
    
          if (mounted) {
            setLatestBlock(fetchedLatestBlock);
          }
        })();
    
        return () => (mounted = false);
    }, [blockNumber]);

    useEffect(() => {
        let mounted = true;

        if (blockNumber) {
            (async () => {
                const blockToFetch = isBlockNumber(blockNumber) ? Number(blockNumber) : blockNumber; 
                const res = await getBlock(blockToFetch);
                const ensName = await reverseLookup(res.miner);
                setRecipient(ensName)

                if (mounted) {
                    setBlockInfo(res);
                    setRewardCalculated(false);
                }
            })();
            return () => (mounted = false);
        }
    }, [blockNumber]);

    // Fetch block reward information based on blockNumber
    useEffect(() => {
        let mounted = true;

        if (blockNumber) {
            (async () => {
                const blockToFetch = isBlockNumber(blockNumber) ? Number(blockNumber) : blockNumber;
                const { blockReward, baseBlockReward, sumMinerTips, totalNephewReward, burnedFee } = await getBlockReward(blockToFetch);

                if (mounted) {
                    setBlockReward(blockReward);
                    setBaseBlockReward(baseBlockReward);
                    setSumMinerTips(sumMinerTips);
                    setTotalNephewReward(totalNephewReward);
                    setBurnedFee(burnedFee);
                    setRewardCalculated(true);
                }
            })();
            return () => (mounted = false);
        }
    }, [blockNumber]);

    return (
        <>
            {blockInfo ? (
                <section>
                    <h1 className="mx-24 my-8 text-xl text-gray-900">
                        Detail Block Info
                    </h1>
                    <div className="bg-white mx-24 px-8 py-4 my-8 border rounded-lg divide-y">
                        <h1 className="pb-3 text-[#3498DA] font-bold">
                            Overview of Block
                            <span className="ml-1">#{blockInfo.number}</span>
                        </h1>

                        <div className="flex">
                            <div className="w-1/2 divide-y">
                                <BlockInfoTitle title="Block" />
                                <BlockInfoTitle title="Time Stamp" />
                                <BlockInfoTitle title="Transactions" />
                                <BlockInfoTitle title="Fee Recipient" />
                                <BlockInfoTitle title="Block Reward" />
                                <BlockInfoTitle title="Gas Used" />
                                <BlockInfoTitle title="Gas Limit" />
                                {blockInfo.baseFeePerGas && (
                                    <>
                                        <BlockInfoTitle title="Base Fee Per Gas" />
                                        <BlockInfoTitle title="Burnt Fees" />
                                    </>
                                )}
                                <BlockInfoTitle title="Extra Data" />
                                <BlockInfoTitle title="Hash" />
                                <BlockInfoTitle title="Parent Hash" />
                                <BlockInfoTitle title="Nonce" />
                                <BlockInfoTitle title="Difficulty" />
                            </div>

                            <div className="divide-y w-full">
                                <p className="py-3 flex items-center">
                                    {blockInfo.number}
                                    <button
                                        className="bg-gray-100 text-xs text-gray-500 p-2 ml-3 rounded-md"
                                        onClick={() => handlePreviousBlock(blockInfo.number - 1)}
                                        disabled={blockInfo.number === 1} 
                                    >
                                        <PiCaretLeftBold />
                                    </button>
                                    <button
                                        className="bg-gray-100 text-xs text-gray-500 p-2 ml-3 rounded-md"
                                        onClick={() => handleNextBlock(blockInfo.number + 1)}
                                        disabled={latestBlock === blockInfo.number} 
                                    >
                                        <PiCaretRightBold />
                                    </button>
                                </p>
                                <p className="py-3">
                                    {formatTimeAgo(blockInfo.timestamp)} ago ({formatTimestamp(blockInfo.timestamp)})
                                </p>
                                <p className="py-3 text-[#357BAD]">
                                    <Link to={`/txs?block=${blockInfo.number}`}>
                                        {blockInfo.transactions !== undefined
                                            ? blockInfo.transactions.length
                                            : 0}
                                        {" transactions"}
                                    </Link>
                                </p>
                                <p className="py-3 text-[#357BAD]">
                                    <Link to={`/address/${blockInfo.miner}`}>
                                        { recipient ? 
                                            <>
                                                <span title={blockInfo.miner}>
                                                {recipient }
                                                </span>
                                            </>
                                            : blockInfo.miner}
                                    </Link>
                                    <CopyToClip text={blockInfo.miner} />
                                </p>
                                <p className="py-3">
                                    {
                                        rewardCalculated ? 
                                        <>
                                            { blockReward }&nbsp;
                                            (<span title="Static Block Reward">{ baseBlockReward}</span> + <span title="Transaction Fees">{sumMinerTips}</span> + <span title="Uncle inclusion Reward">{totalNephewReward} { burnedFee ? 
                                            (
                                                <>
                                                - <span title="Burnt Fee"> { burnedFee }</span>
                                                </>
                                            ):
                                            (<></>)
                                            }</span> )
                                        </>
                                        : "Calculating..."
                                    }
                                </p>
                                <p className="py-3">
                                    {formatNumber(blockInfo.gasUsed.toString())}&nbsp;
                                    ({((blockInfo.gasUsed / blockInfo.gasLimit) * 100).toFixed(2)}%)
                                </p>
                                <p className="py-3">{formatNumber(blockInfo.gasLimit.toString()).toLocaleString()}</p>
                                {
                                    blockInfo.baseFeePerGas && (
                                    <>
                                        <p className="py-3">
                                            {ethers.utils.formatUnits(blockInfo.baseFeePerGas, "gwei")} Gwei
                                            &nbsp; or  &nbsp; 
                                            {ethers.utils.formatUnits(blockInfo.baseFeePerGas, "ether")} Ether
                                        </p>
                                        <p className="py-3">
                                            {formatNumber(ethers.utils.formatUnits(blockInfo.baseFeePerGas.mul(blockInfo.gasUsed), "gwei"))} Gwei
                                            &nbsp; or  &nbsp; 
                                            {formatNumber(ethers.utils.formatUnits(blockInfo.baseFeePerGas.mul(blockInfo.gasUsed), "ether"))} Ether
                                        </p>
                                    </>
                                    )
                                }
                                <p className="py-3">{blockInfo.extraData}</p>
                                <p className="py-3">{blockInfo.hash}</p>
                                <p className="py-3 text-[#357BAD]">
                                    <button
                                        className="text-[#357BAD]"
                                        onClick={() => navigate(`/block/${blockInfo.parentHash}`)}
                                    >
                                        {blockInfo.parentHash}
                                    </button>
                                    <CopyToClip text={blockInfo.parentHash} />
                                </p>
                                <p className="py-3">{blockInfo.nonce}</p>
                                <p className="py-3">{blockInfo.difficulty}</p>
                            </div>
                        </div>
                    </div>
                    <ScrollToTopButton />
                    </section>
            ) : (
                <p className="py-4 pl-10 text-center">Loading...</p>
            )}
        </>
    );
}

function BlockInfoTitle({ title }) {
    return (
        <div className="flex items-center">
            {title === "Time Stamp" ? (
                <WiTime9 size="20" />
            ) : title === "Gas Used" || title === "Gas Limit" ? (
                <PiGasPumpBold />
            ) : title === "Burnt Fees" ? (
                <BsFire />
            ) : title === "Block" ? (
                <PiCubeFill />
            ) : title === "Block Reward" ? (
                <PiMoney />
            ) : (
                <BsInfoCircle />
            )}
            <p className="ml-2 py-3">{title}</p>
        </div>
    );
}

export default Block;
