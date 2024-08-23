import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getBlock, getLatestBlockNumber } from "../utils/alchemy";
import { Link } from "react-router-dom";
import { formatAddress, formatTimeAgo, formatNumber, reverseLookup } from "../utils/common";
import { ethers } from "ethers";
import { CopyToClip } from "../utils/copyToClip";
import Pagination from "./Pagination";

const MAX_ITEMS_PER_PAGE = parseInt(process.env.REACT_APP_MAX_ITEMS_PER_PAGE, 10);

function ListAllBlocks() {
  const location = useLocation();
  const initialBlockNumber = location.state?.initialBlockNumber;

  const [totalBlocks, setTotalBlocks] = useState();
  const [blocksData, setBlocksData] = useState([]);
  const [blockNumber, setBlockNumber] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [postsPerPage, setPostsPerPage] = useState(MAX_ITEMS_PER_PAGE);
  const [isMobile, setIsMobile] = useState(false);
  const isMounted = useRef(true);
  const [ensNames, setEnsNames] = useState({});

  const handlePagination = (pageNumber) => {
    setCurrentPage(pageNumber);
    const newBlockNumber = totalBlocks - ((pageNumber - 1) * postsPerPage);
    setBlockNumber(newBlockNumber);
  };

  const handlePostsPerPageChange = (e) => {
    const newPostsPerPage = Number(e.target.value);
    const newTotalPages = Math.ceil(totalBlocks / newPostsPerPage);

    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }

    setPostsPerPage(newPostsPerPage);
    setBlocksData([]);
  };

  // Screen size detector
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1330); 
    };

    handleResize(); // Check screen size on component mount
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const fetchLatestBlockNumber = async () => {
      const latestBlock = await getLatestBlockNumber();
      if (isMounted.current) {
        setBlockNumber(latestBlock);
        setTotalBlocks(latestBlock + 1);
      }
    };

    if (currentPage === 1 || !initialBlockNumber) {
      fetchLatestBlockNumber();
    }

    return () => (isMounted.current = false);
  }, [currentPage, initialBlockNumber]);

  useEffect(() => {
    if (blockNumber) {
      setBlocksData([]);
      setLoading(true);
    }
  }, [blockNumber, postsPerPage]);

  useEffect(() => {
    isMounted.current = true;

    const fetchBlocks = async () => {
      if (blockNumber && blocksData.length === 0) {
        for (let i = 0; i < postsPerPage; i++) {
          if (blockNumber - i < 0) break;
          const block = await getBlock(blockNumber - i);

          if (isMounted.current) {
            setBlocksData((prevBlocksData) =>
              [...prevBlocksData, block].sort((a, b) => b.number - a.number)
            );

            if (block.miner && !ensNames[block.miner]) {
              const ensName = await reverseLookup(block.miner);
              setEnsNames((prevEnsNames) => ({
                ...prevEnsNames,
                [block.miner]: ensName || formatAddress(block.miner),
              }));
            }
          }
        }
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchBlocks();

    return () => (isMounted.current = false);
  }, [blockNumber, postsPerPage, blocksData.length]);

  const renderBlockData = (blockData, index) => {
    const minerAddress = ensNames[blockData.miner] || formatAddress(blockData.miner);
    return (
      <div key={index} className="flex flex-col bg-gray-50 p-4 rounded-lg my-4">
        {isMobile ? (
          <>
            <p>
              <strong>Block:</strong>
              <Link to={`/block/${blockData.number}`} className="text-[#357BAD]">
                {blockData.number.toString()}
              </Link>
            </p>
            <p>
              <strong>Age:</strong>
              {blockData.timestamp > 0 ? formatTimeAgo(blockData.timestamp) : "9 years"}
            </p>
            <p>
              <strong>Txn:</strong>
              <Link to={`/txs?block={blockData.number}`} className="text-[#357BAD]">
                {blockData.transactions.length}
              </Link>
            </p>
            <p>
              <strong>Fee Recipient:</strong>
              <Link to={`/address/${blockData.miner}`} className="text-[#357BAD]">
                {minerAddress}
              </Link>
              <CopyToClip text={blockData.miner} className="ml-2" />
            </p>
            <p>
              <strong>Gas Used (Gwei):</strong>
              {ethers.utils.formatUnits(blockData.gasUsed, "gwei")}
            </p>
            <p>
              <strong>Gas Limit (Gwei):</strong> 
              {formatNumber(blockData.gasLimit.toString())}
            </p>
            {
              blockData.baseFeePerGas ? (
                <>
                  <p><strong>Base Fee (Gwei):</strong> {ethers.utils.formatUnits(blockData.baseFeePerGas, "gwei")}</p>
                  <p><strong>Burnt Fee (Eth):</strong> {formatNumber(ethers.utils.formatUnits(blockData.baseFeePerGas.mul(blockData.gasUsed), "ether"), 6)}</p>
                </>
              ) : (
                <>
                  <p><strong>Base Fee (Gwei):</strong> 0</p>
                  <p><strong>Burnt Fee (Eth):</strong> 0</p>
                </>
              )
            }
          </>
        ) : (
          <div className="flex py-4">
            <p className="w-1/12 text-[#357BAD]">
              <Link to={`/block/${blockData.number}`}>
                {blockData.number.toString()}
              </Link>
            </p>
            <p className="w-1/12">
              {blockData.timestamp > 0 ? formatTimeAgo(blockData.timestamp) : "9 years"}
            </p>
            <p className="w-1/12 text-[#357BAD]">
              <Link to={`/txs?block={blockData.number}`}>
                {blockData.transactions.length}
              </Link>
            </p>
            <p className="w-2/12 text-[#357BAD]">
              <Link to={`/address/${blockData.miner}`}>
                {minerAddress}
              </Link>
              <CopyToClip text={blockData.miner} className="ml-2" />
            </p>
            <p className="w-2/12">
              {ethers.utils.formatUnits(blockData.gasUsed, "gwei")}
            </p>
            <p className="w-2/12">
              {formatNumber(blockData.gasLimit.toString())}
            </p>
            {
              blockData.baseFeePerGas ? (
                <>
                  <p className="w-2/12">{ethers.utils.formatUnits(blockData.baseFeePerGas, "gwei")}</p>
                  <p className="w-1/12">
                    {formatNumber(ethers.utils.formatUnits(blockData.baseFeePerGas.mul(blockData.gasUsed), "ether"), 6)}
                  </p>
                </>
              ) : (
                <>
                  <p className="w-2/12">0</p>
                  <p className="w-1/12">0</p>
                </>
              )
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="bg-white mx-4 sm:mx-24 px-4 sm:px-8 py-4 my-8 border rounded-lg">
      {
        loading && blocksData.length === 0 ? (
          <h1 className="text-center">Loading...</h1>
        ) : (
          <>
            <div className="pb-4">
              <p className="font-bold text-lg"> Total blocks: {formatNumber(totalBlocks)} </p>
              <p className="text-sm text-[#6C757E]">
                Showing block between #
                {blocksData[blocksData.length - 1]?.number?.toString() || '...'} to #
                {blocksData[0]?.number?.toString() || '...'}
              </p>
            </div>

            {!isMobile && (
              <div className="flex py-2 text-black-900">
                <p className="w-1/12 py-3 text-[#6C757E] font-bold">Block</p>
                <p className="w-1/12 py-3 text-[#6C757E] font-bold">Age</p>
                <p className="w-1/12 py-3 text-[#6C757E] font-bold">Txn</p>
                <p className="w-2/12 py-3 text-[#6C757E] font-bold">Fee Recipient</p>
                <p className="w-2/12 py-3 text-[#6C757E] font-bold">Gas Used (Gwei)</p>
                <p className="w-2/12 py-3 text-[#6C757E] font-bold">Gas Limit (Gwei)</p>
                <p className="w-2/12 py-3 text-[#6C757E] font-bold">Base Fee (Gwei)</p>
                <p className="w-1/12 py-3 text-[#6C757E] font-bold">Burnt Fee (Eth)</p>
              </div>
            )}

            {blocksData.map((blockData, index) => renderBlockData(blockData, index))}

            <div className="flex justify-between items-center mt-4">
              <div>
                <label className="mr-2">Records per page:</label>
                <select
                  value={postsPerPage}
                  onChange={handlePostsPerPageChange}
                  className="p-2 border rounded"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <Pagination
                length={totalBlocks}
                postsPerPage={postsPerPage}
                handlePagination={handlePagination}
                currentPage={currentPage}
              />
            </div>
          </>
        )
      }
    </section>
  );
}

export default ListAllBlocks;
