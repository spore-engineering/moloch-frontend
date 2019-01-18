import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Grid, Icon, Label, Dropdown, Form, Button } from "semantic-ui-react";

const user = {
  "name": "Malcom Jans",
  "shares": 78
};

class MainMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Link to={`/members/${user.name}`} className="item">
          <p><Icon name="user"></Icon>View Profile</p>
        </Link>
        <Dropdown.Divider />
        <Dropdown.Item icon="dollar" className="item" content="Withdraw Loot Token" onClick={() => this.props.onLoadWithdrawLootToken()} />
        <Dropdown.Divider />
        <Dropdown.Item icon="key" className="item" content="Change Delegate Key" onClick={() => this.props.onLoadChangeDelegateKey()} />
        <Dropdown.Divider />
        <Link to="/login" className="item">
          <p><Icon name="power off"></Icon>Sign Out</p>
        </Link>
      </div>
    );
  }
}

class ChangeDelegateKeyMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Dropdown.Item icon="arrow left" className="item" content="Back to Menu" onClick={() => this.props.onLoadMain()} />
        <Dropdown.Divider />
        <Dropdown.Item className="item">
          <p><Icon name="key"></Icon>Change Delegate Key</p>
          <Form.Input placeholder="Enter new key address"></Form.Input>
          <Button>Save</Button>
        </Dropdown.Item>
      </div>
    );
  }
}

class WithdrawLootTokenMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Dropdown.Item icon="arrow left" className="item" content="Back to Menu" onClick={() => this.props.onLoadMain()} />
        <Dropdown.Divider />
        <Dropdown.Item className="item">
          <p><Icon name="dollar"></Icon>Withdraw Loot Token</p>
          <Form.Input placeholder="Enter withdrawal address"></Form.Input>
          <Form.Input placeholder="0"></Form.Input>
          <Button>Withdraw</Button>
        </Dropdown.Item>
      </div>
    );
  }
}

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visibleMenu: 'main'
    }
  }

  render() {
    let topRightMenuContent;

    switch(this.state.visibleMenu) {
      case 'main':
        topRightMenuContent = <MainMenu onLoadChangeDelegateKey={() => this.setState({visibleMenu: 'changeDelegateKey'})} onLoadWithdrawLootToken={() => this.setState({visibleMenu: 'withdrawLootToken'})}></MainMenu>
        break;
      case 'changeDelegateKey':
        topRightMenuContent = <ChangeDelegateKeyMenu onLoadMain={() => this.setState({visibleMenu: 'main'})}></ChangeDelegateKeyMenu>
        break;
      case 'withdrawLootToken':
        topRightMenuContent = <WithdrawLootTokenMenu onLoadMain={() => this.setState({visibleMenu: 'main'})}></WithdrawLootTokenMenu>
        break;
    }

    return(
      <div id="header">
        <Grid columns='equal' verticalAlign="middle">
          <Grid.Column textAlign="left" className="menu">
            <Dropdown text={
              <Icon name="bars" />
            }>
              <Dropdown.Menu className="menu blurred" direction="right">
                <Link to="guildbank" className="item">
                  <p>Guild Bank</p>
                </Link>
                <Dropdown.Divider />
                <Link to="/members" className="item">
                  <p>Members</p>
                </Link>
                <Dropdown.Divider />
                <Link to="/proposals" className="item">
                  <p>Proposals</p>
                </Link>
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
          <Grid.Column textAlign="center" className="logo">
            <Link to="/">MOLOCH</Link>
          </Grid.Column>
          <Grid.Column textAlign="right" className="dropdown">
            <Dropdown text={
              <Label circular color='teal' className="label">A</Label>
            }>
              <Dropdown.Menu className="menu blurred" direction="left">
                {topRightMenuContent}
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}