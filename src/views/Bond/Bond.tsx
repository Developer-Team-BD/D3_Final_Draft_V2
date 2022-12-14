import {
  ChangeEvent,
  Fragment,
  ReactNode,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router";
import { usePathForNetwork } from "../../hooks/usePathForNetwork";
import { t, Trans } from "@lingui/macro";
import { formatCurrency, trim } from "../../helpers";
import {
  Backdrop,
  Box,
  Fade,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import TabPanel from "../../components/TabPanel";
import BondHeader from "./BondHeader";
import BondRedeem from "./BondRedeem";
import BondPurchase from "./BondPurchase";
import "./bond.scss";
import { useWeb3Context } from "../../hooks/web3Context";
import { Skeleton } from "@material-ui/lab";
import { useAppSelector } from "../../hooks";
import { IAllBondData } from "../../hooks/Bonds";

type InputEvent = ChangeEvent<HTMLInputElement>;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Bond = ({ bond }: { bond: IAllBondData }) => {
  console.log("bondPage---->>");
  console.log("bond-->>+++", bond);
  const history = useHistory();
  const { provider, address } = useWeb3Context();
  const networkId = useAppSelector((state) => state.network.networkId);
  usePathForNetwork({ pathName: "bonds", networkID: networkId, history });
  const marketPrice: number | undefined = useAppSelector((state) => {
    return state.app.marketPrice;
  });
  const [slippage, setSlippage] = useState<number>(0.5);
  const [recipientAddress, setRecipientAddress] = useState<string>(address);

  const [view, setView] = useState<number>(0);
  const [quantity, setQuantity] = useState<number | undefined>();

  const isBondLoading = useAppSelector<boolean>(
    (state) => state.bonding.loading ?? true
  );

  const onRecipientAddressChange = (e: InputEvent): void => {
    return setRecipientAddress(e.target.value);
  };

  const onSlippageChange = (e: InputEvent): void => {
    return setSlippage(Number(e.target.value));
  };

  const onClickAway = (): void => {
    history.goBack();
  };

  const onClickModal = (e: any): void => {
    e.stopPropagation();
  };
  useEffect(() => {
    if (address) setRecipientAddress(address);
  }, [provider, quantity, address]);

  const changeView = (event: ChangeEvent<{}>, value: string | number): void => {
    setView(Number(value));
  };


  /* CODE */
  const [mint , setMint]=useState(true)
  return (
    <>
      <Fade in={true} mountOnEnter unmountOnExit>
        <Grid container id="bond-view">
           <Backdrop open={true} onClick={onClickAway}>
             <Fade in={true}>
               <Paper className="ohm-card ohm-model"  onClick={onClickModal}> {/*ohm-card ohm-modal*/}
                <BondHeader
                  bond={bond}
                  slippage={slippage}
                  recipientAddress={recipientAddress}
                  onSlippageChange={onSlippageChange}
                  onRecipientAddressChange={onRecipientAddressChange}
                />

                  <Box display="flex" flexDirection="row" className="bond-price-data-row">
                    <div className="bond-price-data">
                      <Typography variant="h5" color="textSecondary">
                        <Trans>Mint Price</Trans>
                      </Typography>
                      <Typography variant="h3" className="price" color="primary">
                        <>
                          {isBondLoading ? (
                            <Skeleton width="50px" />
                          ) : (
                            <DisplayBondPrice key={bond.name} bond={bond} />
                          )}
                        </>
                      </Typography>
                    </div>
                    <div className="bond-price-data">
                      <Typography variant="h5" color="textSecondary">
                        <Trans>Market Price</Trans>
                      </Typography>
                      <Typography variant="h3" color="primary" className="price">
                        {isBondLoading ? <Skeleton /> : <>${trim(marketPrice, 3)}</>}
                      </Typography>
                    </div>
                  </Box>

                  {/* <Tabs
                    value={view}
                    textColor="primary"
                    indicatorColor="primary"
                    onChange={changeView}
                    aria-label="bond tabs"
                    className="bond_tab"
                  >
                    <Tab
                      aria-label="bond-tab-button"
                      label={t({
                        id: "Mint",
                        comment: "The action of bonding (verb)",
                      })}
                      {...a11yProps(0)}
                      className="bond_tab_box"
                    />
                    <Tab
                      aria-label="redeem-tab-button"
                      label={t`Redeem`}
                      {...a11yProps(1)}
                      className="bond_tab_box"
                    />
                  </Tabs>

                  <TabPanel value={view} index={0}>
                    <BondPurchase
                      bond={bond}
                      slippage={slippage}
                      recipientAddress={recipientAddress}
                    />
                  </TabPanel>

                  <TabPanel value={view} index={1}>
                    <BondRedeem bond={bond} />
                  </TabPanel> */}
                    <Grid item style={{display:"flex", justifyContent:"space-around"}} >
                        <button onClick={()=>setMint(true)} className={mint==true? "mint_btn":"mint_btn borderBottom_none"}>Mint</button>
                        <button onClick={()=>setMint(false)} className={mint===false? "mint_btn ":"mint_btn borderBottom_none"}>Redeem</button>
                    </Grid>
                    {
                      mint?  <BondPurchase
                      bond={bond}
                      slippage={slippage}
                      recipientAddress={recipientAddress}
                    />:<BondRedeem bond={bond} />
                    }
              </Paper>
           </Fade>
         </Backdrop>
       </Grid>
     </Fade>
    </>
  );
};

export const DisplayBondPrice = ({
  bond,
}: {
  bond: IAllBondData;
}): ReactElement => {
  const networkId = useAppSelector((state) => state.network.networkId);

  if (typeof bond.bondPrice === undefined || !bond.getBondability(networkId)) {
    return <Fragment>--</Fragment>;
  }

  return (
    <Fragment>
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(bond.bondPrice)}
    </Fragment>
  );
};

export const DisplayBondDiscount = ({
  bond,
}: {
  bond: IAllBondData;
}): ReactNode => {
  const networkId = useAppSelector((state) => state.network.networkId);

  if (
    typeof bond.bondDiscount === undefined ||
    !bond.getBondability(networkId)
  ) {
    return <Fragment>--</Fragment>;
  }

  return (
    <Fragment>
      {bond.bondDiscount && trim(bond.bondDiscount * 100, 2)}%
    </Fragment>
  );
};
export default Bond;
