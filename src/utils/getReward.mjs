//const axios = require('axios');
import axios from "axios"
import { ethers, BigNumber } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();


const ALCHEMY_API_URL = process.env.REACT_APP_MAINNET_API_URL;
export const getBlockReward = async (blockNum) => {
  const getBlock = async (num) => {
    try {
      const blockNumHex = ethers.utils.hexlify(num);
      const blockRes = await axios.post(ALCHEMY_API_URL, {
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [blockNumHex, true],
        id: 0,
      });
 console.log(blockRes.data.result)
      return blockRes.data.result;
    } catch (error) {
      console.error("Error fetching block:", error);
    }
  };

  const getGasUsage = async (hash) => {
    try {
      const txRes = await axios.post(ALCHEMY_API_URL, {
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [hash],
        id: 0,
      });
      return txRes.data.result.gasUsed;
    } catch (error) {
      console.error("Error fetching transaction receipt:", error);
    }
  };

  const getUncle = async (hash) => {
    try {
      const uncleRes = await axios.post(ALCHEMY_API_URL, {
        jsonrpc: "2.0",
        method: "eth_getBlockByHash",
        params: [hash, false],
        id: 0,
      });
      console.log(uncleRes.data.result)
      return uncleRes.data.result;
    } catch (error) {
      console.error("Error fetching uncle block:", error);
    }
  };

  try {
    console.log("Fetching block rewards...");
    const block = await getBlock(blockNum);
    if (!block) {
      console.log("Block not found");
      return;
    }

    const blockNumber = parseInt(block.number, 16);
    const transactions = block.transactions;
    const baseFeePerGas = block.baseFeePerGas ? BigNumber.from(block.baseFeePerGas) : BigNumber.from(0);
    const gasUsed = block.gasUsed ? BigNumber.from(block.gasUsed) : BigNumber.from(0);

    let minerTips = [];
    let sumMinerTips = 0;
    for (const tx of transactions) {
      const txGasUsage = await getGasUsage(tx.hash);
      const totalFee = ethers.utils.formatEther(
        BigNumber.from(txGasUsage).mul(BigNumber.from(tx.gasPrice))
      );
      minerTips.push(Number(totalFee));
    }

    if (transactions.length > 0) {
      sumMinerTips = minerTips.reduce(
        (prevTip, currentTip) => prevTip + currentTip
      );
    }

    const burnedFee = ethers.utils.formatEther(
      gasUsed.mul(baseFeePerGas)
    );

    const baseBlockReward =  block.number >= 4370000 ? block.number >= 7280000 ?  baseFeePerGas == 0 ? 2 : 0 : 3 : 5;
    const nephewReward = baseBlockReward / 32;
    const uncleCount = block.uncles ? block.uncles.length : 0;
    const totalNephewReward = uncleCount * nephewReward;

    let uncleRewardsArr = [];

    console.log("bu", block.uncles)
    if (block.uncles && block.uncles.length > 0) {
      for (const uncleHash of block.uncles) {
        const uncle = await getUncle(uncleHash);
        if (uncle) {
          const uncleNum = parseInt(uncle.number, 16);
          const uncleMiner = uncle.miner;
          const uncleReward = ((uncleNum + 8 - blockNumber) * baseBlockReward) / 8;
          uncleRewardsArr.push({
            reward: `${uncleReward}ETH`,
            miner: uncleMiner,
          });

        } else {
          console.log(`Uncle block for hash ${uncleHash} not found`);
        }
      }
    }

    const blockReward = baseBlockReward + (sumMinerTips - Number(burnedFee));

    if (uncleCount > 0) {
      // console.log("Block reward:", blockReward + totalNephewReward + "ETH");
      // console.log("miner:", block.miner);
      // console.log("uncleRewardsArr:", uncleRewardsArr);
      return blockReward + totalNephewReward;
    } else {
      // console.log("Block reward:", blockReward + "ETH");
      // console.log("miner:", block.miner);

      return blockReward;
    }
  } catch (error) {
    console.log("Error fetching block:", error);
  }
};
/// block with uncles 8364113

getBlockReward(22134);
