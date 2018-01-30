import {sendEvent} from '../analytics/AnalyticsActions'
import { browserHistory } from 'react-router'
import bluebird from 'bluebird'

// Web 3 handoff UX
export const REQUEST_SENT = 'REQUEST_SENT'
function requestSent() {
  return {
    type: REQUEST_SENT
  }
}


export function sendAnalytics(eventType, eventData) {
  return function(dispatch) {
    dispatch(sendEvent(eventType, eventData))
  }
}


export function actionThing(parameter1) {

  return function(dispatch) {

    // "loading"
    dispatch(requestSent())
    // analytics
    dispatch(sendEvent('drain', { 'amount': amount}))

    // dispatch(transactionSuccess(result))

  }
}
