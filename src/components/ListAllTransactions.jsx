import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getBlockWithTransactions, getLatestBlockNumber } from "../utils/alchemy";
import { formatAddress, formatTimeAgo, reverseLookup } from "../utils/common";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { CopyToClip } from "../utils/copyToClip";
import Pagination from "./Pagination";
import ScrollToTopButton from "./ScrollToTopButton";

const ListBlockTransactions = () => {
  const MAX_ITEMS_PER_PAGE = parseInt(process.env.REACT_APP_MAX_ITEMS_PER_PAGE, 10);
  const resolveName = process.env.REACT_APP_RESOLVE_NAME;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryBlockNumber = parseInt(searchParams.get("block"), 10);

  const [transactions, setTransactions] = useState([]);
  const [blockNumber, setBlockNumber] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [latestBlock, setLatestBlock] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(MAX_ITEMS_PER_PAGE);
  const [ensNamesFrom, setEnsNamesFrom] = useState({});
  const [ensNamesTo, setEnsNamesTo] = useState({});

  useEffect(() => {
    let mounted = true;

    (async () => {
      const fetchedLatestBlock = await getLatestBlockNumber();

      if (mounted) {
        setLatestBlock(fetchedLatestBlock);
        setBlockNumber(queryBlockNumber || fetchedLatestBlock);
      }

      setLoading(false);
    })();

    return () => (mounted = false);
  }, [queryBlockNumber]);

  useEffect(() => {
    if (blockNumber) {
      const fetchBlockTransactions = async () => {
        setLoading(true);
        const block = await getBlockWithTransactions(blockNumber);

        // Attach the block's timestamp to each transaction
        const transactionsWithTimestamps = block.transactions.map((tx) => ({
          ...tx,
          timestamp: block.timestamp,
        }));
        setTransactions(transactionsWithTimestamps);

        let txRec = 0
        for (let tx of block.transactions) 
        {
          if (txRec === postsPerPage) break;
          if (resolveName) 
          {
            if (!ensNamesFrom[tx.from]) 
            {
              const ensNameFrom = await reverseLookup(tx.from);
              setEnsNamesFrom((prevEnsNames) => ({
                ...prevEnsNames,
                [tx.from]: ensNameFrom || formatAddress(tx.from),
              }));
            }

            if (tx.to && !ensNamesTo[tx.to]) 
            {
              const ensNameTo = await reverseLookup(tx.to);
              setEnsNamesTo((prevEnsNames) => ({
                ...prevEnsNames,
                [tx.to]: ensNameTo || formatAddress(tx.to),
              }));
            }
            txRec++;
          }
        }

        setLoading(false);
      };

      fetchBlockTransactions();
    }
  }, [blockNumber]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstPost, indexOfLastPost);

  const handleNextBlock = () => setBlockNumber((prev) => prev + 1);
  const handlePreviousBlock = () => setBlockNumber((prev) => Math.max(1, prev - 1)); // Prevent going below block 1

  const handlePostsPerPageChange = (e) => {
    const newPostsPerPage = Number(e.target.value);
    const newTotalPages = Math.ceil(transactions.length / newPostsPerPage);

    // Ensure current page is not out of bounds
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }

    setPostsPerPage(newPostsPerPage);
  };

  const handlePagination = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <section className="bg-white mx-24 px-8 py-4 my-8 border rounded-lg divide-y">
        <div className="pb-4 flex justify-between items-center">
          <p className="font-bold text-lg">Block #{blockNumber}</p>
          <p className="font-bold text-lg">Total Transactions: {transactions.length}</p>
          <div>
            <button
              className="mr-2 p-2 bg-blue-500 text-white rounded"
              onClick={handlePreviousBlock}
              disabled={blockNumber === 1}
            >
              Previous Block
            </button>
            <button
              className="p-2 bg-blue-500 text-white rounded"
              onClick={handleNextBlock}
              disabled={blockNumber === latestBlock}
            >
              Next Block
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-5">Loading...</div>
        ) : currentTransactions.length ? (
          <div>
            <div className="hidden md:grid grid-cols-6 gap-2 py-4 px-4 items-center">
              <div className="pl-3">Txn #</div>
              <div className="pl-1">Block</div>
              <div className="pl-1">Age</div>
              <div className="pl-3">From</div>
              <div className="pl-3">To</div>
              <div className="pl-1">Amt (Eth)</div>
            </div>
            {currentTransactions.map((tx, index) => 
              {
                const minerAddressFrom = ensNamesFrom[tx.from] || formatAddress(tx.from);
                const minerAddressTo = ensNamesTo[tx.to] || formatAddress(tx.to);
                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 py-4 px-4 items-center border-b"
                  >
                    <div className="flex items-center">
                      <Link to={`/tx/${tx.hash}`} className="text-[#357BAD]">
                        {formatAddress(tx.hash)}
                      </Link>
                      <CopyToClip text={tx.hash} className="ml-2" />
                    </div>
                    <div className="flex items-center pl-4">
                      <Link to={`/block/${tx.blockNumber}`} className="text-[#357BAD]">
                        {tx.blockNumber}
                      </Link>
                    </div>
                    <div className="flex items-center pl-4">{formatTimeAgo(tx.timestamp)}</div>
                    <div className="flex items-center pl-4">
                      <Link to={`/address/${tx.from}`} className="text-[#357BAD]">
                        {minerAddressFrom}
                      </Link>
                      <CopyToClip text={tx.from} className="ml-2" />
                    </div>
                    <div className="flex items-center pl-4">
                      <Link to={`/address/${tx.to}`} className="text-[#357BAD]">
                        {minerAddressTo}
                      </Link>
                      <CopyToClip text={tx.to} className="ml-2" />
                    </div>
                    <div className="flex items-center pl-4">
                      {ethers.utils.formatUnits(tx.value, "ether")}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        ) : (
          <div className="py-5">No transactions found for this block.</div>
        )}

        {/* Pagination and Posts Per Page Selector */}
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
            length={transactions.length}
            postsPerPage={postsPerPage}
            handlePagination={handlePagination}
            currentPage={currentPage}
          />
        </div>
        <ScrollToTopButton />
      </section>
    </>
  );
};

export default ListBlockTransactions;
