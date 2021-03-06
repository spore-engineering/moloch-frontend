import React, { Component } from 'react';
import { Divider, Grid, Icon, Segment, Button, Progress, Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import hood from 'assets/hood.png';

import { connect } from 'react-redux';
import { fetchProposalDetail, fetchMembers, postEvents, fetchMemberDetail } from './actions';

const ProgressBar = ({ yes, no }) => (
  <>
    <div style={{ "position": "relative" }}>
      <Progress percent={yes + no} color="red" size="big" style={{
        "position": "absolute",
        "top": "0",
        "width": "100%"
      }} />
      <Progress percent={yes} color="green" size="big" />
    </div>
    <Grid columns="equal">
      <Grid.Column floated="left">
        {yes}% Yes
      </Grid.Column>
      <Grid.Column floated="right" textAlign="right">
        {no}% No
      </Grid.Column>
    </Grid>
  </>
);

const MemberAvatar = ({ name, shares }) => (
  <Grid.Column mobile={4} tablet={3} computer={3} textAlign="center" className="member_avatar" title={name}>
    <Link to={`/members/${name}`} className="uncolored">
      <Image src={hood} centered />
      <p className="name">{!name ? '' : (name.length > 10 ? name.substring(0, 10) + '...' : name)}</p>

    </Link>
  </Grid.Column>
);

class ProposalDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedUser: JSON.parse(localStorage.getItem('loggedUser')).address,
      proposal_detail: this.props.proposal_detail,
      limitTo: 4,
      type: '', //membership or project
      userShare: 0,
      totalShares: 0,
      votedYes: 0,
      votedNo: 0,
      isAccepted: false
    }

    this.handleNo = this.handleNo.bind(this);
    this.handleYes = this.handleYes.bind(this);
    this.handleProcess = this.handleProcess.bind(this);
    this.sendProposalUpdate = this.sendProposalUpdate.bind(this);
    this.onLoadMore = this.onLoadMore.bind(this);
    this.calculateVote = this.calculateVote.bind(this);
  }

  componentDidMount() {
    // get loggedin user details
    this.props.fetchMemberDetail(this.state.loggedUser)
      .then((responseJson) => {
        this.setState({
          userShare: (responseJson.items.member.shares) ? responseJson.items.member.shares : 0,
          totalShares: responseJson.items.totalShares
        });

      })
    // Retrieve the data of the proposal.
    let id = this.props.match.params.id
    this.setState({ type: this.props.match.params.type });
    switch (this.props.match.params.type) {
      case 'members':
        this.props.fetchMemberDetail(id)
          .then((responseJson) => {
            if (responseJson.type === "FETCH_MEMBER_DETAIL_SUCCESS") {
              this.loadData(responseJson);
            } else {
              alert('Error retrieving the proposal.');
            }
          });
        break;
      case 'projects':
        this.props.fetchProposalDetail(id)
          .then((responseJson) => {
            if (responseJson.type === "FETCH_PROPOSAL_DETAIL_SUCCESS") {
              this.loadData(responseJson);
            } else {
              alert('Error retrieving the proposal.');
            }
          });
        break;
      default:
        break;
    }
    this.props.fetchMembers();
  }

  loadData(responseJson) {
    this.setState({ proposal_detail: (responseJson.items.member ? responseJson.items.member : responseJson.items), isAccepted : (responseJson.items.status === 'accepted' ? true : false)});
    let voters = this.state.proposal_detail.voters ? this.state.proposal_detail.voters : [];
    let userHasVoted = voters.find(voter => voter.member === this.state.loggedUser) ? true : false;
    this.setState({ userHasVoted });
    this.calculateVote(voters);
  }

  calculateVote(voters) {
    // calculate votes
    let totalNumberVotedYes = 0;
    let totalNumberVotedNo = 0;
    if (voters) {
      voters.map((voter, idx) => {
        if (voter.shares) {
          switch (voter.vote) {
            case 'yes':
              totalNumberVotedYes += voter.shares;
              break;
            case 'no':
              totalNumberVotedNo += voter.shares;
              break;
            default: break;
          }
        }
      });
      let percentYes = typeof ((parseInt((totalNumberVotedYes / this.state.totalShares) * 100))) !== 'number' ? 0 : (parseInt((totalNumberVotedYes / this.state.totalShares) * 100));
      let percentNo = typeof (parseInt(((totalNumberVotedNo / this.state.totalShares) * 100))) !== 'number' ? 0 : parseInt(((totalNumberVotedNo / this.state.totalShares) * 100));
      this.setState({
        votedYes: percentYes,
        votedNo: percentNo
      });
    }
  }

  handleNo() {
    // Add the voter to the voters of the proposal.
    let voters = {
      member: JSON.parse(localStorage.getItem("loggedUser")).address,
      vote: 'no',
      shares: this.state.userShare
    };
    this.setState({ userHasVoted: true });
    let name = (this.state.type === 'members') ? 'Membership proposal voted' : 'Project proposal voted';
    this.sendProposalUpdate(name, voters);
  }

  handleYes() {
    // Add the voter to the voters of the proposal.
    let voters = {
      member: JSON.parse(localStorage.getItem("loggedUser")).address,
      vote: 'yes',
      shares: this.state.userShare
    };
    this.setState({ userHasVoted: true });
    let name = (this.state.type === 'members') ? 'Membership proposal voted' : 'Project proposal voted';
    this.sendProposalUpdate(name, voters);
  }

  handleProcess() {
    let name = (this.state.type === 'members') ? 'Membership proposal processed' : 'Project proposal processed';
    this.sendProposalUpdate(name, null);
  }

  sendProposalUpdate(eventName, voter) {
    let proposal = this.state.proposal_detail;
    if (!proposal.voters) {
      proposal.voters = [];
    }
    if (voter) {
      proposal.voters.push(voter);
    }
    let self = this;
    this.props.postEvents(JSON.stringify({ id: '', name: eventName, payload: proposal }))
      .then((responseJson) => {
        if (responseJson.type === "POST_EVENTS_SUCCESS") {
          self.calculateVote(proposal.voters);
          self.setState({isAccepted : (responseJson.items.payload.status === 'accepted' ? true : false )});
          switch (eventName) {
            case 'Project proposal voted':
            case 'Membership proposal voted':
              alert('Voted on proposal');
              break;
            case 'Project proposal processed':
            case 'Membership proposal processed':
              alert('Proposal processed');
              break;
            default:
              break;
          }
        } else {
          alert('Error processing proposal');
        }
      });
  }

  onLoadMore() {
    this.setState({
      limitTo: this.state.limitTo + 4
    });
  }

  render() {
    return (
      <div id="proposal_detail">
        <Grid centered columns={16}>
          <Segment className="transparent box segment" textAlign='center'>
            <Grid centered columns={14}  >
              <Grid.Column mobile={16} tablet={16} computer={12}  >
                <span className="title">{this.state.proposal_detail.title}</span>
              </Grid.Column>
            </Grid>
            <Grid centered columns={14}  >
              <Grid.Column mobile={16} tablet={16} computer={4}  >
                <div className="subtext description">
                  {this.state.proposal_detail.description}
                </div>

                <Grid columns="equal" className="tokens">
                  <Grid.Row>
                    {this.state.proposal_detail.assets.map((token, idx) => (
                      <Grid.Column key={idx} className="tributes">
                        <Segment className="pill" textAlign="center">
                          <Icon name="ethereum" />{token.amount} {token.asset}
                        </Segment>
                      </Grid.Column>
                    ))}
                  </Grid.Row>
                  {/* <Grid.Row>
                    {this.state.proposal_detail.assets.map((token, idx) => (
                      <Grid.Column key={idx} mobile={16} tablet={8} computer={5} className="tributes">
                        <Segment className="pill" textAlign="center">
                          <Icon name="ethereum" />{token.amount} {token.asset}
                        </Segment>
                      </Grid.Column>
                    ))}
                  </Grid.Row> */}
                </Grid>
                <Grid columns="equal">
                  <Grid.Column>
                    <p className="subtext">Total USD Value</p>
                    <p className="amount">$6,000</p>
                  </Grid.Column>
                  <Grid.Column textAlign="right">
                    <p className="subtext voting">Voting Shares</p>
                    <p className="amount">200</p>
                  </Grid.Column>
                </Grid>
              </Grid.Column>

              <Grid.Column mobile={16} tablet={16} computer={2}   >
                <Divider vertical />
              </Grid.Column>

              <Grid.Column mobile={16} tablet={16} computer={6} >

                <Grid columns={16}>
                  <Grid.Column textAlign="left" mobile={16} tablet={8} computer={8} className="pill_column" >
                    <span className="pill">
                      <span className="subtext">Voting Ends:</span>&nbsp; 12 days
                    </span>
                  </Grid.Column>
                  <Grid.Column textAlign="right" className="pill_column grace" mobile={16} tablet={8} computer={8}>
                    <span className="pill">
                      <span className="subtext">Grace Period:</span>&nbsp; {this.state.proposal_detail.period}
                    </span>
                  </Grid.Column>
                </Grid>
                <Grid columns={16} className='member_list' >
                  <Grid.Row>
                    <Grid.Column mobile={16} tablet={16} computer={16} className="pill_column"  >
                      <Grid>
                        <Grid.Row className="members_row" >
                          {/* centered */}
                          {this.props.members.slice(0, this.state.limitTo).map((elder, idx) => <MemberAvatar {...elder} key={idx} />)}
                          {this.state.limitTo < this.props.members.length ?
                            <Grid.Column mobile={4} tablet={3} computer={3} textAlign="center" className="member_avatar">
                              <Button className="caret_btn" circular icon='caret down' color='grey' onClick={this.onLoadMore} />
                              <p className="name">...</p>
                            </Grid.Column> : null}

                        </Grid.Row>
                      </Grid>
                    </Grid.Column >
                  </Grid.Row>
                </Grid>
                <Grid>
                  <Grid.Column>
                    <ProgressBar yes={this.state.votedYes} no={this.state.votedNo}></ProgressBar>
                  </Grid.Column>
                </Grid>
                {this.state.userShare && this.props.match.params.status === 'inprogress' ?
                  <Grid columns="equal" centered>
                    <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5} >
                      <Button className="btn" color='grey' disabled={this.state.userHasVoted || this.state.isAccepted} onClick={this.handleNo}>Vote No</Button>
                    </Grid.Column>
                    <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5} >
                      <Button className="btn" color='grey' disabled={this.state.userHasVoted || this.state.isAccepted} onClick={this.handleYes}>Vote Yes</Button>
                    </Grid.Column>
                    <Grid.Column textAlign="center" mobile={16} tablet={5} computer={5} >
                      <Button className="btn" color='grey' onClick={this.handleProcess} disabled={(this.state.votedYes > 50 && !this.state.isAccepted) ? false : true}>Process Proposal</Button>
                    </Grid.Column>
                  </Grid> : null}

              </Grid.Column>
            </Grid>
          </Segment>
        </Grid>
      </div>
    );
  }
}

// This function is used to convert redux global state to desired props.
function mapStateToProps(state) {
  return {
    proposal_detail: state.proposalDetail.items,
    members: state.members.items,
  };
}

// This function is used to provide callbacks to container component.
function mapDispatchToProps(dispatch) {
  return {
    fetchProposalDetail: function (id) {
      return dispatch(fetchProposalDetail(id));
    },
    fetchMembers: function () {
      dispatch(fetchMembers());
    },
    fetchMemberDetail: function (id) {
      return dispatch(fetchMemberDetail(id));
    },
    postEvents: function (data) {
      return dispatch(postEvents(data))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProposalDetail);
