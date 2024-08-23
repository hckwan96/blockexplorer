import { ethers } from "ethers";

/**
 * Calculate elapsed time in seconds
 *
 * @param {*} blockTimestamp block or transaction timestamp in seconds
 * @returns
 */
export function formatAgeInSeconds(blockTimestamp) {
  return (Date.now() / 1000 - blockTimestamp).toFixed(2) + " secs";
}

export function formatTimeAgo(blockTimestamp)
{
  let TimeLapsed = (Date.now() / 1000) - blockTimestamp;
  let Tmin = Math.floor(TimeLapsed / 60);
	let Thour = Math.floor(TimeLapsed / 3600);
	let Tday = Math.floor(TimeLapsed / 86400);
	let Tweek = Math.floor(TimeLapsed / 604800);
	let Tmon = Math.floor(TimeLapsed / 2600640);
	let Tyear = Math.floor(TimeLapsed / 31207680);

  if (TimeLapsed < 60)
    return TimeLapsed.toFixed(2) + " secs";
	else if (Tmin <= 60)
  {
		if (Tmin === 1)
      return Tmin + " min"
		else
		  return Tmin + " mins"
  }
	else if (Thour <= 24)
  {
		if (Thour === 1)
			return Thour + " hr";
		else
      return Thour + " hrs";
  } 
	else if (Tday <= 7)
  {
		if (Tday === 1)
			return Tday + " day";
		else
      return Tday + " days";
  }
	else if (Tweek <= 4.3)
  {
		if (Tweek === 1)
      return Tweek + " week";
		else
			return Tweek  + " weeks";
	}
	else if  (Tmon <= 12)
  {
    if (Tmon === 1)
      return Tmon + " month";
    else
      return Tmon + " months";
	}
	else
  {
    if (Tyear === 1)
      return Tyear + " year";
		else
      return Tyear + " year";
  }
}

/**
 * Format MM/DD/YYYY
 *
 * @param {*} timestamp block or transaction timestamp in seconds
 * @returns
 */
export function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    //month: "2-digit",
    month: "short",
    day: "2-digit",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName:"short",
  }).format(timestamp * 1000);
}

/**
 * Format currency
 *
 * @param {*} timestamp block or transaction timestamp in seconds
 * @returns
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}


export function formatAddress(address)
{
  return address.slice(0, 6) + "..." + address.slice(-4)
}

export function formatNumber(number, digit = 15)
{
  if (number < 1)
    return new Intl.NumberFormat("en-GB", {
        maximumFractionDigits: digit,
      }).format(number);
  else
    return new Intl.NumberFormat("en-GB").format(number);
}

export function convertToTimestamp(dt)
{
 return Math.floor(new Date(new Date(dt).toUTCString()) / 1000);
}

export const reverseLookup = async (address)  =>
{
  try {
    //const provider = new ethers.providers.InfuraProvider('mainnet', process.env.REACT_APP_INFURA_API_URL); 

    const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet-public.unifra.io");
    const ensName = await provider.lookupAddress(address);

    return ensName;
  }
  catch (error) {
    console.error('Error performing reverse lookup:', error);
  }
}