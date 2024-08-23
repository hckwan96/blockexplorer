import { useEffect, useState } from "react";
import { GrDocumentStore } from "react-icons/gr";
import { getBlockWithTransactions} from "../utils/alchemy";
import { formatAddress, reverseLookup } from "../utils/common";
import { Link } from "react-router-dom";
import { CopyToClip } from "../utils/copyToClip";

const MAX_ITEMS_PER_PAGE = process.env.REACT_APP_MAX_ITEMS_PER_PAGE;
const resolveName = process.env.REACT_APP_RESOLVE_NAME;

export default function ListTransactions({ blockNumber }) {
  let hasCopy = true;
  let [blockWithTransactions, setBlockWithTransactions] = useState("");

  const [ensNamesFrom, setEnsNamesFrom] = useState({});
  const [ensNamesTo, setEnsNamesTo] = useState({});

  useEffect(() => {
    let mounted = true;

    if (blockNumber && !blockWithTransactions)
    {
      (async () => {
        const res = await getBlockWithTransactions(blockNumber);

        if (mounted)
        {
          setBlockWithTransactions(res);

          let txRec = 0
          for (let tx of res.transactions) 
          {
            if (txRec === MAX_ITEMS_PER_PAGE) break;
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
        }
      })();
      return () => mounted = false;
    }
  });

  return (
    <>
      {blockNumber &&
      blockWithTransactions &&
      blockWithTransactions.transactions ? (
        <div>
          <div className="hidden md:grid grid-cols-3 gap-4 py-4 items-center">
            <div className="pl-4">Txn #</div>
            <div className="pl-4">From</div>
            <div className="pl-4">To</div>
          </div>
          {blockWithTransactions.transactions.length ? (
            blockWithTransactions.transactions
              .slice(0, MAX_ITEMS_PER_PAGE)
              .map((tx, index) =>
              {
                const minerAddressFrom = ensNamesFrom[tx.from] || formatAddress(tx.from);
                const minerAddressTo = ensNamesTo[tx.to] || formatAddress(tx.to);
                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 items-center border-b"
                  >
                    <div className="flex items-center pl-4">
                      <div className="mr-4 bg-gray-100 rounded-lg px-4 py-3">
                        <GrDocumentStore size="18" color="#000" />
                      </div>
                      <div className="flex items-center">
                        <span className="block lg:hidden md:inline-block text-xs text-gray-500 md:mr-2">
                          Txn #:
                        </span>
                        <Link to={`/tx/${tx.hash}`} className="text-[#357BAD]">
                          {formatAddress(tx.hash)}
                        </Link>
                        {hasCopy && <CopyToClip text={tx.hash} className="ml-2" />}
                      </div>
                    </div>
                    <div className="flex items-center pl-4">
                      <span className="block lg:hidden md:inline-block text-xs text-gray-500 md:mr-2">
                        From:
                      </span>
                      <Link to={`/address/${tx.from}`} className="text-[#357BAD]">
                        {minerAddressFrom}
                      </Link>
                      {hasCopy && <CopyToClip text={tx.from} className="ml-2" />}
                    </div>
                    <div className="flex items-center pl-4">
                      <span className="block lg:hidden md:inline-block text-xs text-gray-500 md:mr-2">
                        To:
                      </span>
                      <Link to={`/address/${tx.to}`} className="text-[#357BAD]">
                        {minerAddressTo}
                      </Link>
                      {hasCopy && <CopyToClip text={tx.to} className="ml-2" />}
                    </div>
                  </div>
                );
              })
          ) : (
            <div>Empty</div>
          )}
        </div>
      ) : (
        <div className="py-5">Loading...</div>
      )}
      <div className="p-4 text-center">
        <Link
          to={{
            pathname: "/txs",
            state: { initialBlockNumber: blockNumber }
          }}
          className="block bg-sky-100 text-sky-500 text-xs p-2 rounded-md"
        >
          View All Transactions
        </Link>
      </div>
    </>
  );
}
