const crypto = require("crypto");
const moment = require("moment"); // Ensure moment is installed or just use native dates

class VNPayService {
  static createPaymentUrl(req, orderId, amount, orderInfo) {
    let tmnCode = process.env.VNP_TMN_CODE || "DUMMY123";
    let secretKey = process.env.VNP_HASH_SECRET || "DUMMYSECRETKEY";
    let vnpUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl = process.env.VNP_RETURN_URL || "http://localhost:3000/api/payment/vnpay-return";
    
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = this.sortObject(vnp_Params);
    
    let signData = new URLSearchParams(vnp_Params).toString();
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + new URLSearchParams(vnp_Params).toString();
    
    return vnpUrl;
  }

  static verifyIpn(reqQuery) {
    let vnp_Params = reqQuery;
    let secureHash = vnp_Params["vnp_SecureHash"];
    
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = this.sortObject(vnp_Params);
    let secretKey = process.env.VNP_HASH_SECRET || "DUMMYSECRETKEY";
    let signData = new URLSearchParams(vnp_Params).toString();
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if(secureHash === signed){
      // Valid signature
      return {
        isValid: true,
        orderId: vnp_Params["vnp_TxnRef"],
        amount: vnp_Params["vnp_Amount"] / 100,
        responseCode: vnp_Params["vnp_ResponseCode"] // 00 is success
      };
    } else {
      return { isValid: false };
    }
  }

  static sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }
}

module.exports = VNPayService;
