const {
 Button,
  colors,
  createMuiTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
  MuiThemeProvider,
  Typography,
  withStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableFooter,
  TablePagination,
  TableRow,
  Tab,
  Tabs,
  Drawer,
  AppBar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Toolbar,
  GridList,
  GridListTile,
  SwipeableDrawer
  } = window['material-ui'];


const drawerWidth = 240;

const styles = theme => ({
  root: {
   zIndex: 1,
   overflow: "hidden",
   position: "relative",
  },
  button: {
   margin: theme.spacing.unit,
  },
  appBar: {
   zIndex: theme.zIndex.drawer + 1,
   width: `calc(100% - ${drawerWidth}px)`,
   marginLeft: drawerWidth
  },
  drawerPaper: {
   position: 'relative',
   width: drawerWidth,
  },
  code: {
   margin: "50px",
   height: "400px",
   fontFamily: "Roboto, sans-serif",
   fontSize: "16px",
  },
  content: {
   flexGrow: 1,
   backgroundColor: theme.palette.background.default,
   padding: theme.spacing.unit * 3,
   minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
  heading: {
   fontSize: theme.typography.pxToRem(15),
   flexBasis: "10%",
   flexShrink: 0,
  },
  secondaryHeading: {
   fontSize: theme.typography.pxToRem(15),
   color: theme.palette.text.secondary,
  },
  row: {
   "[selected]": {
    backgroundColor: theme.palette.background.default,
   },
   cursor: "pointer"
  }
 });

@withStyles(styles)
class Dataset extends React.Component {

  constructor() {
   super();
   this.state = {"summary": false, "code": false};
  }

  toggleDrawer(side, open) {
   // console.log("toggling");
   this.setState({
     [side]: open,
      });
  }

  render() {
   const {classes} = this.props;
   const feed = this.props.feed;
   feed.items = feed.items || [];

   let download = feed.download;
   // console.log(feed);
   return (
            <div className={classes.root}>
              <main className={classes.content}>
                <center>
                  <Button variant="outlined" color="primary" className={classes.button}>Images</Button>
                  <Button variant="outlined" className={classes.button} 
                    onClick={this.toggleDrawer.bind(this, "summary", true)}>
                    Details
                  </Button>
                  <Button variant="outlined" className={classes.button}
                    onClick={this.toggleDrawer.bind(this, "code", true)}>
                    Code
                  </Button>
                  <Button variant="outlined" className={classes.button} disabled={download == undefined}>
                    <a href={download}>Download</a>
                  </Button>
                </center>

                <SwipeableDrawer 
                  anchor="top"
                  open={this.state.summary}
                  onClose={this.toggleDrawer.bind(this, "summary", false)}
                  onOpen={this.toggleDrawer.bind(this, "summary", true)}
                  >
                  <Row name="release number" value={feed.release} description="hello world" />
                  <Row name="download" value={feed.download} description="hello world" />
                  <Row name="release date" value={feed.dateReleased} description="hello world" />
                  <Row name="creation date" value={feed.dateCreated} description="hello world" />
                  <Row name="published date" value={feed.datePublished} description="hello world" />
                  <Row name="modified date" value={feed.dateModified} description="hello world" />
                </SwipeableDrawer>

                <SwipeableDrawer 
                  anchor="top"
                  open={this.state.code}
                  onClose={this.toggleDrawer.bind(this, "code", false)}
                  onOpen={this.toggleDrawer.bind(this, "code", true)}
                  >

                  <textarea className={classes.code}>
                    {JSON.stringify(this.props.feed, undefined, 2)}
                  </textarea>

                </SwipeableDrawer>

                <br />
                <Typography variant="headline" component="h3" className={classes.heading}>{feed.name}</Typography>
                  
                <br />
                <Typography variant="subheading" className={classes.heading}>{feed.description}</Typography>

                <br />
                <br />
                <br />

                <Browser feed={this.props.feed} />

              </main>
            </div>
           );
  }
 }

@withStyles(styles)
class Browser extends React.Component {
  constructor(props) {
   super();
   this.state = {
    selected: 0,
    page: 0,
    url: props.feed.url
   };

   // alert(props.dataset.classes);
   this.state.items = (props.feed.items || []).map(item => {
     // if (typeof item != "string") {
     // return {status: "loaded", value: item};
     // } else {
     return {status: "loading", value: item};
     // }
    });

   this.fetch();
  }

 async fetch() {
  // console.log(this.state.items);
  // return;
  let items = this.state.items;
  let expand = (image) => typeof image == "string" ? { url: image } : image;
  for (let i = 0; i < items.length; i++) {
   let item = items[i];
   // console.log(item);
   if (item.status == "loaded") {
    // passed by value
    item.value.examples = item.value.target.examples.map(expand);
    continue;
   }
   // console.log(item);
   let url = item.value.arTarget.url;
   let result = await fetch(url);
   // console.log(result);
   if (!result.ok) {
    items[i].status = "failed";
    this.setState({items: items});
   } else {
    items[i].status = "loaded";
    items[i].value.arTarget = await result.json();
    // console.log(url);
    // console.log(this.state.url);
    // console.log()
    items[i].value.arTarget.url = new URL(url, this.state.url);
    // console.log(items[i].value);
    this.setState({items: items});
   }
  }
 }

 handleChangePage(event, page) {
  const PAGE_SIZE = 5;
  // console.log(page);
  // console.log(page * PAGE_SIZE);
  this.setState({page: page, selected: PAGE_SIZE * page});
 };

 handleClick(e, id) {
  this.setState({selected: id});
 }

 render() {
  const {classes} = this.props;
  const list = this.state.items;
  let offset = this.state.page;
  const PAGE_SIZE = 5;
  let page = list.slice(offset * PAGE_SIZE, (offset + 1) * PAGE_SIZE);
  // let total = list.length / PAGE_SIZE;
  let total = list.length;
  let selected = this.state.selected;

  // console.log(offset);
  // console.log(list.length);
  // console.log(page);

  return (
            <div>
                <Paper>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Class</TableCell>
                        <TableCell>Number of images</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                      page.map((item, id) => {
                        let key = item.status == "loaded" ? item.value.arTarget.name : item.status;
                        let value = item.status == "loaded" ? (item.value.arTarget.images || []).length : item.status;
                        return (
                          <TableRow 
                             className={classes.row}
                             onClick={event => this.handleClick(event, offset * PAGE_SIZE + id)}
                             selected={(offset * PAGE_SIZE + id) == selected}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        )
                      })
                      }
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                           colSpan={2}
                           count={total}
                           rowsPerPage={PAGE_SIZE}
                           page={offset}
                           rowsPerPageOptions={PAGE_SIZE}
                           onChangePage={this.handleChangePage.bind(this)}
                           />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </Paper>

                <br /> 
                <Gallery item={list[selected]} />
                <br />

            </div>
          );
 }
}

@withStyles(styles)
class Gallery extends React.Component {
 constructor() {
  super();
  this.state = {selected: undefined};
 }
 handleToggle() {
  if (this.state.selected != undefined) {
   this.setState({selected: undefined});
  }
 }
 render() {
  const {classes} = this.props;
  let {value, status} = this.props.item;
  if (status != "loaded") {
   return (<div />);
  }
  let item = value;
  let clazz = item.arTarget;
  // console.log(clazz.images);
  let asset = item.arContent;
  asset.thumbnail = new URL(asset.thumbnail, clazz.url);
  // console.log(asset);
  // console.log(clazz.examples);
  return (
            <div>
              <Typography className={classes.heading}>{item.arTarget.name || ""}</Typography>
              <br />
              <Typography className={classes.heading}>{item.arTarget.description || ""}</Typography>
              <br />
              <br />

              <Typography className={classes.heading}>Content</Typography>
    
              <br />
              <br />

              <Paper elevation="1" style={{padding: "10px", width: "400px"}}>
                <img style={{maxWidth: 100, float: "left"}} src={asset.thumbnail} />
                <Typography className={classes.heading} style={{float: "left", marginLeft: 10}}>
                  <a href={asset.url}>{asset.title || ""}</a>
                </Typography>
                <div style={{clear: "both"}} />
              </Paper>

              <br />
              <br />

              <Typography className={classes.heading}>Examples</Typography>

              <br />
              <br />

              <GridList cellHeight={160} className={classes.gridList} cols={5}>
              {
                (clazz.images || []).map((image, index) => {
                  // console.log(clazz);
                  let url = typeof image == "string" ? new URL(image, clazz.url) : new URL(image.url, clazz.url);
                  
                  let key = `${image.name}-${index}-${url}`;
                  return (
                    <GridListTile key={key}>
                      <img style={{cursor: "pointer"}} src={url} onClick={() => this.setState({selected: index})}/>
                    </GridListTile>
                  )
                })
                }
              </GridList>

              <Dialog open={this.state.selected != undefined} onClose={this.handleToggle.bind(this)}>
                <DialogTitle>Image</DialogTitle>
                <div onClick={this.handleToggle.bind(this)}>
                 {(function() {
                    if (this.state.selected == undefined) {
                     return;
                    }
                    let image = clazz.images[this.state.selected];
                    let url = typeof image == "string" ? new URL(image, clazz.url) : new URL(image.url, clazz.url);
                    // let url = typeof image == "string" ? image : image.url;
                    return (<img src={url} style={{width: "100%"}} />);
                 }).bind(this)()}
                </div>
              </Dialog>
            </div>
          );
 }
}

@withStyles(styles)
class Row extends React.Component {
 render() {
  const {classes} = this.props;
  return (
             <ExpansionPanel>
               <ExpansionPanelSummary>
                 <Typography className={classes.heading}>{this.props.name}</Typography>
                 <Typography className={classes.secondaryHeading}>{this.props.value}</Typography>
               </ExpansionPanelSummary>
               <ExpansionPanelDetails>
                 <Typography>{this.props.description}</Typography>
               </ExpansionPanelDetails>
             </ExpansionPanel>
          );
 }
}
            
function render(feed, error, el) {
 // Use the ReactDOM.render to show your component on the browser
 // const root = document.getElementById("root");
 let root = document.createElement("div");
 el.parentNode.insertBefore(root, el);
 ReactDOM.render(<Dataset feed={feed} error={error}/>, root);
}

async function load(file) {
 try {
  let result = await fetch(file);
  if (!result.ok) {
   return {error: `Failed to load ${file}. ${result}`};
  }
  
  return {feed: await result.json()};
 } catch (e) {
  return {error: `Failed to loading ${file}. Check your JS console.`};
 }
}

async function main() {
 let selector = document.querySelector("script[type='application/ld+json']");
 if (!selector) {
  console.log("no JSON-LD file found in this page");
  return;
 }

 let file = selector.src;
 let el = selector;

 let {feed, error} = await load(file);
 feed.url = feed.url || new URL(file, window.location.href);
 render(feed, error, el);
}

main();
