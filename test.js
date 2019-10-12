<head>
  ...
  <script src="https://cdn.0xproject.com/scripts/trade-widget.js" />
  ...
</head>;
ZeroEx.TradeWidget.render(
  {
    precision: 8,
    onChangeAmount: ({ amount, ether }) => {},
    onSuccess: () => {},
    onError: error => {}
  },
  "body"
);

const useRates = amount => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({});

  useEffect(() => {
    let mounted = true;
    if (!amount) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const values = await client.getRates(amount);
        if (!mounted) return;
        setLoading(false);
        setValues(values);
      } catch (e) {
        if (!mounted) return;
        setLoading(false);
        setError(e);
      }
    };
    fetch();

    return () => (mounted = false);
  }, [amount]);

  return values;
};

const Rates = ({ amount }) => {
  const { ether, dollar, loading, error } = useRates(amount);
  return (
    <Box>
      {" "}
      {ether} {dollar}
    </Box>
  );
};

const UserToken = ({ precision }) => {
  const [amount, setAmount] = useState("");
  const [amountDebounced] = useDebounce(amount, 100);

  return (
    <Box>
      <input value={amount} onChange={e => setAmount(e.target.value)} />
      <Box>
        <Rates amount={amountDebounced} />
      </Box>
    </Box>
  );
};

<Card>
  <Card.Header>
    <UserToken />
  </Card.Header>
  <Card.Content>
    <PaymentMethod />
    <OrderDetails />
  </Card.Content>
  <Card.Actions>
    <Button>placing order</Button>
  </Card.Actions>
</Card>;


//1kb
const called = false;
window.ZeroEx.TradeWidget = {
	render() {
		called = true;
	}
}
load real js =>

	//real code of the library
//load rest the js sdk
if (called) //render()

window.ZeroEx.TradeWidget.render= () => {
	ReactDom.render(<App />, )
}
