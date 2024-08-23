import { Alchemy, Network } from "alchemy-sdk";
import axios from 'axios'; // Fix the import statement
import { ethers, BigNumber } from "ethers";

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const MAX_ITEMS_PER_PAGE = process.env.REACT_APP_MAX_ITEMS_PER_PAGE;
const ALCHEMY_API_URL = process.env.REACT_APP_MAINNET_API_URL;

export const alchemy = new Alchemy(settings);

export const getBlock = async (_blockNumber) => 
  await alchemy.core.getBlock(_blockNumber);

export const getBlockWithTransactions = async (_blockNumber) => 
  await alchemy.core.getBlockWithTransactions(_blockNumber);

export const getLatestBlockNumber = async () => await alchemy.core.getBlockNumber();

export const getTransactionReceipt = async (transaction) => {
  return {
    ...(await alchemy.transact.getTransaction(transaction)),
    ...(await alchemy.core.getTransactionReceipt(transaction)),
  };
};

export const getAddressBalance = async (_address) => {
  return {
    balance: await alchemy.core.getBalance(_address),
  };
};

export const getAddressTokens = async (_address, _records) => {
  let tokenBalances = await alchemy.core.getTokenBalances(_address);

  if (tokenBalances && tokenBalances.tokenBalances) {
    tokenBalances = tokenBalances.tokenBalances
      .filter((token) => {
        return (
          token.tokenBalance !==
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );
      })
      .slice(0, _records);

    for (let token of tokenBalances) {
      let balance = token.tokenBalance;
      const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
      balance = balance / Math.pow(10, metadata.decimals);
      balance = balance.toFixed(2);
      token.normalizedBalance = balance;
      Object.assign(token, metadata);
    }
  } else {
    tokenBalances = [];
  }

  return {
    tokenBalances: tokenBalances,
  };
};

export const getAddressTransactions = async (
  _address,
  _dir,
  _fromBlock = "0x0",
  _categories = ["external", "internal", "erc20", "erc721", "erc1155"]
) => {
  let options = {
    fromBlock: _fromBlock,
    category: _categories,
    withMetadata: true,
    maxCount: MAX_ITEMS_PER_PAGE,
    order: "desc",
  };

  if (_dir === "to") options["toAddress"] = _address;
  else options["fromAddress"] = _address;

  let transactions = await alchemy.core.getAssetTransfers(options);
  return transactions;
};

export const getTransactionReceiptOnly = async (_hash) => {
  const res = await alchemy.core.getTransactionReceipt(_hash);
  return res;
};

export const getBlockReward = async (blockNum) => {
  const jsonrpc = "2.0";
  const method = String(blockNum).startsWith("0x") ? "eth_getBlockByHash" : "eth_getBlockByNumber";
  
  const getEthBlock = async (num) => {
    try {
      const blockNumHex = String(num).startsWith("0x") ? num : ethers.utils.hexlify(Number(num));
      const blockRes = await axios.post(ALCHEMY_API_URL, {
        jsonrpc: jsonrpc,
        method: method,
        params: [blockNumHex, true],
        id: 0,
      });

      return blockRes.data.result;
    } catch (error) {
      console.error("Error fetching block:", error);
    }
  };

  const getGasUsage = async (hash) => {
    try {
      const txRes = await axios.post(ALCHEMY_API_URL, {
        jsonrpc: jsonrpc,
        method: "eth_getTransactionReceipt",
        params: [hash],
        id: 0,
      });

      return txRes.data.result.gasUsed;
    }
    catch (error)
    {
      console.error("Error fetching transaction receipt:", error);
    }
  };

  const getUncle = async (hash) => {
    try {
      const uncleRes = await axios.post(ALCHEMY_API_URL, {
        jsonrpc: jsonrpc,
        method: "eth_getBlockByHash",
        params: [hash, false],
        id: 0,
      });
      
      return uncleRes.data.result;
    }
    catch (error)
    {
      console.error("Error fetching uncle block:", error);
    }
  };

  try {
    console.log("Fetching block rewards...");
    const block = await getEthBlock(blockNum);

    if (!block)
      {
      console.log("Block not found");
      return;
    }

    const blockNumber = parseInt(block.number, 16);
    const transactions = block.transactions;
    const baseFeePerGas = block.baseFeePerGas ? BigNumber.from(block.baseFeePerGas) : BigNumber.from(0);
    const gasUsed = block.gasUsed ? BigNumber.from(block.gasUsed) : BigNumber.from(0);

    let minerTips = [];
    let sumMinerTips = 0;

    for (const tx of transactions)
    {
      const txGasUsage = await getGasUsage(tx.hash);
      const totalFee = ethers.utils.formatEther(
        BigNumber.from(txGasUsage).mul(BigNumber.from(tx.gasPrice))
      );

      minerTips.push(Number(totalFee));
    }

    if (transactions.length > 0) {
      sumMinerTips = minerTips.reduce((prevTip, currentTip) => prevTip + currentTip);
    }

    const burnedFee = ethers.utils.formatEther(gasUsed.mul(baseFeePerGas));
    const baseBlockReward =
      block.number >= 4370000
        ? block.number >= 7280000
          ? baseFeePerGas === 0
            ? 2
            : 0
          : 3
        : 5;
    const nephewReward = baseBlockReward / 32;
    const uncleCount = block.uncles ? block.uncles.length : 0;
    const totalNephewReward = uncleCount * nephewReward;

    let uncleRewardsArr = [];
    if (block.uncles && block.uncles.length > 0)
    {
      for (const uncleHash of block.uncles)
      {
        const uncle = await getUncle(uncleHash);
        if (uncle)
        {
          const uncleNum = parseInt(uncle.number, 16);
          const uncleMiner = uncle.miner;
          const uncleReward = ((uncleNum + 8 - blockNumber) * baseBlockReward) / 8;
          uncleRewardsArr.push({
            reward: `${uncleReward}ETH`,
            miner: uncleMiner,
          });
          console.log(uncleRewardsArr)
        }
        else
        {
          console.log(`Uncle block for hash ${uncleHash} not found`);
        }
      }
    }

    const blockReward = baseBlockReward + (sumMinerTips - Number(burnedFee));

    if (uncleCount > 0)
    {
      return {"blockReward":blockReward + totalNephewReward, 
        "baseBlockReward": baseBlockReward, 
        "sumMinerTips": sumMinerTips, 
        "totalNephewReward": totalNephewReward,
        "burnedFee": burnedFee};
    }
    else
    {
      return {"blockReward":blockReward , 
        "baseBlockReward": baseBlockReward, 
        "sumMinerTips": sumMinerTips, 
        "totalNephewReward": totalNephewReward, 
        "burnedFee": burnedFee};
    }
  }
  catch (error)
  {
    console.log("Error fetching block:", error);
  }
};


export async function getBlockNumberForTimestamp(timestamp) {
  const provider = new ethers.providers.AlchemyProvider("homestead", settings.apiKey);
  const block = await provider.getBlock("latest");
  let blockNumber = block.number;

  // Binary search to find the block number closest to the timestamp
  let lower = 0;
  let upper = blockNumber;
  while (lower <= upper) {
    const mid = Math.floor((lower + upper) / 2);
    const block = await provider.getBlock(mid);
    if (block.timestamp < timestamp) {
      lower = mid + 1;
    } else {
      upper = mid - 1;
    }
  }
  return lower;
}

export async function getTotalTransactionsForDate(date) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
  const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

  const startBlockNumber = await getBlockNumberForTimestamp(startTimestamp);
  const endBlockNumber = await getBlockNumberForTimestamp(endTimestamp);

  let totalTransactions = 0;
  for (let i = startBlockNumber; i <= endBlockNumber; i++) {
    const block = await alchemy.core.getBlockWithTransactions(i);
  
    totalTransactions += block.transactions.length;
  }

  return totalTransactions;
}
