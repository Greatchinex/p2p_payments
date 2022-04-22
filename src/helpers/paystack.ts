import axios from 'axios'
import { config } from 'dotenv'

import Logger from '../config/logger'

config()

const FLUTTERWAVE_SECRET_KEY = process.env.PAYSTACK_SK
const PAYSTACK_BASEURL = 'https://api.paystack.co/'

interface IResolveAcctNumber {
  account_number: string
  bank_code: string
}

class PaystackHelper {
  private paystackConnect() {
    return axios.create({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`
      },
      baseURL: PAYSTACK_BASEURL
    })
  }

  public async initiateFunding(body: any) {
    try {
      const { data } = await this.paystackConnect().post('transaction/initialize', body)

      return {
        message: data.message,
        status: data.status,
        data: data.data
      }
    } catch (error) {
      const errResp = error.response?.data?.message ?? 'Could not initiate funding'
      Logger.error(
        'Paystack Error: Failed to Initiate Funding ===> %o, ===> %s',
        error.response?.data,
        error.message
      )
      return {
        message: errResp,
        status: false,
        data: null
      }
    }
  }

  public async verifyTransaction(reference: string) {
    const { data } = await this.paystackConnect().get(`transaction/verify/${reference}`)

    return data.data
  }

  public async resolveAcctNumber({ account_number, bank_code }: IResolveAcctNumber) {
    try {
      const { data } = await this.paystackConnect().get(
        `resolve?account_number=${account_number}&bank_code=${bank_code}`
      )

      return {
        message: data.message,
        status: data.status,
        data: data.data
      }
    } catch (error) {
      const errResp = error.response?.data?.message ?? 'Could resolve account number'
      Logger.error('Paystack Error: Failed fetch bank account number ===> %o', error.response?.data)

      return {
        message: errResp,
        status: false,
        data: null
      }
    }
  }

  public async listBanks() {
    try {
      const { data } = await this.paystackConnect().get(`bank`)

      return {
        message: data.message,
        status: data.status,
        data: data.data
      }
    } catch (error) {
      const errResp = error.response?.data?.message ?? 'Could not fetch banks'
      Logger.error('Paystack Error: Failed to fetch banks ===> %o', error.response?.data)

      return {
        message: errResp,
        status: false,
        data: null
      }
    }
  }
}

export const paystackHelper = new PaystackHelper()
