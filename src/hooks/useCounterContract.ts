import { useEffect, useState } from 'react';
import Counter from '../contracts/counter';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, OpenedContract } from '@ton/core';
import { useTonConnect } from './useTonConnect';
import { sleep } from '../utils';

export function useCounterContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | number>();
  const { sender } = useTonConnect();


  const counterContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Counter(
      Address.parse('EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb') // replace with your address from tutorial 2 step 8
    );
    return client.open(contract) as OpenedContract<Counter>;
  }, [client]);


  useEffect(() => {
    async function getValue() {
      if (!counterContract) return;
      const val = await counterContract.getCounter();
      setVal(Number(val));
    }
    getValue();
  }, [counterContract]);

  return {
    value: val,
    address: counterContract?.address.toString(),
    sendIncrement: async () => {
      const state = await client?.getContractState(counterContract?.address!)
      try {
        await counterContract?.sendIncrement(sender);
        while (true) {
          const newState = await client?.getContractState(counterContract?.address!)
          if (state?.blockId.seqno !== newState?.blockId.seqno) {
            break;
          }
          await sleep(1500);
        }

        const val = await counterContract?.getCounter();
        setVal(Number(val));
      } catch (err) {
        console.error('Error:', err)
      }
    },
  };
}
