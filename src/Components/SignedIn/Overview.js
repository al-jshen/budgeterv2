import React, { Component } from 'react';
import Sidebar from './Sidebar';
import Log from './Log';
import db from './FirestoreDB';
import firebase from 'firebase';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme} from 'victory';
import { connect } from 'react-redux';


const data = [
  {quarter: 1, earnings: 13000},
  {quarter: 2, earnings: 16500},
  {quarter: 3, earnings: 14250},
  {quarter: 4, earnings: 19000}
]

class Overview extends Component {

  constructor(props) {
    super(props);
    this.updateUser = this.updateUser.bind(this);
    this.getTransactions = this.getTransactions.bind(this);
  }

  updateUser() {
    let user = firebase.auth().currentUser;
    if (user) {
      this.props.getCurrentUser(user)
    }
  }

  getTransactions() {
    let transList = db.collection('users').doc(this.props.uid).collection('transactions');
    transList.onSnapshot((docSnapshot) => {
      let dat = docSnapshot.docs.map((doc) => ({
        category: doc.data().category,
        cost: doc.data().cost,
        date: doc.data().date.seconds * 1000
      }))
      this.props.getTransactions(dat);
    })
  }

  componentWillMount() {
    this.updateUser();
    this.getTransactions();
  }

  render() {
    return (
      <div>

        <Sidebar />

        Hello {this.props.displayName}

        <Log />

        {this.props.transactions.map((item, i) => {
          const dat = item
          return (
            <div key={i}>A {dat.category} purchase on {new Date(dat.date).toDateString()} cost ${dat.cost}</div>
          )
        })}

        <div className='overview'>
          <VictoryChart domainPadding={20} theme={VictoryTheme.material} scale={{ x: "time" }}>
            <VictoryBar
              data={this.props.transactions}
              x={(datum) => new Date(datum.date).toDateString()}
              y={(datum) => datum.cost}/>
          </VictoryChart>
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) => {
  return({
    displayName: state.user.displayName,
    uid: state.user.uid,
    transactions: state.transactions
  })
}

const mapDispatchToProps = (dispatch) => ({
    getCurrentUser: (user) => {
      dispatch({
        type: 'GET_USER',
        user: user
      })
    },
    getTransactions: (transactions) => {
      dispatch({
        type: 'GET_TRANSACTIONS',
        transactions: transactions
      })
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
