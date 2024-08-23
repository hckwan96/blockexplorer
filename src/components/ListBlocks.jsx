import { useEffect, useState, useRef } from "react";
import { getBlock } from "../utils/alchemy";
import { formatTimeAgo, formatAddress, reverseLookup } from "../utils/common";
import { Link } from "react-router-dom";
import { IoCubeOutline } from "react-icons/io5";
import { CopyToClip } from "../utils/copyToClip";

const MAX_ITEMS_PER_PAGE = process.env.REACT_APP_MAX_ITEMS_PER_PAGE;
const resolveName = process.env.REACT_APP_RESOLVE_NAME;

export default function ListBlocks({ blockNumber }) {
  let hasCopy = true;
  let latestBlocks = [];
  const [blocks, setBlocks] = useState([]);
  const [ensNames, setEnsNames] = useState({});
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (blockNumber) {
      (async () => {
        for (let i = 0; i < MAX_ITEMS_PER_PAGE; i++) {
          const block = await getBlock(blockNumber - i);
          if (isMounted.current)
          {
            latestBlocks.push(block);
            setBlocks([...latestBlocks]);
            
            if (block.miner && !ensNames[block.miner] && resolveName) 
            {
              const ensName = await reverseLookup(block.miner);
              setEnsNames((prevEnsNames) => ({
                ...prevEnsNames,
                [block.miner]: ensName || formatAddress(block.miner),
              }));
            }
          }
        }
      })();
    }

    return () => {
      isMounted.current = false;
    };
  }, [blockNumber]);

  return (
    <>
      {blockNumber && blocks.length ? (
        <div>
          <div className="grid grid-cols-3 gap-4 py-4 items-center">
            <div className="pl-4">Block #</div>
            <div className="pl-4">Fee Recipient</div>
            <div className="pl-4">Txns</div>
          </div>
          {
            blocks.map((block, index) => 
            {
              const minerAddress = ensNames[block.miner] || formatAddress(block.miner);
              return (
                <div
                  key={block.number}
                  className="grid grid-cols-3 gap-4 py-4 items-center border-b"
                >
                  <div className="flex items-center pl-4">
                    <div className="mr-4 bg-gray-100 rounded-lg px-4 py-3">
                      <IoCubeOutline size="18" color="#000" />
                    </div>
                    <div>
                      <Link to={`/block/${block.number}`} className="text-[#357BAD]">
                        {block.number}
                      </Link>
                      <div className="text-xs">
                        {formatTimeAgo(block.timestamp)} ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center pl-4">
                    <Link to={`/address/${block.miner}`} className="text-[#357BAD]">
                      {minerAddress}
                    </Link>
                    {hasCopy && (
                      <CopyToClip text={block.miner} className="ml-2" />
                    )}
                  </div>
                  <div className="pl-4">
                    <Link to={`/txs?block=${block.number}`} className="text-[#357BAD]">
                      {block.transactions.length} txns
                    </Link>
                  </div>
                </div>
              )
            })
          }
        </div>
      ) : (
        <div className="py-5">Loading...</div>
      )}
      <div className="p-4 text-center">
        <Link
          to={{
            pathname: "/blocks",
            state: { initialBlockNumber: blockNumber }
          }}
          className="block bg-sky-100 text-sky-500 text-xs p-2 rounded-md"
        >
          View All Blocks
        </Link>
      </div>
    </>
  );
}
