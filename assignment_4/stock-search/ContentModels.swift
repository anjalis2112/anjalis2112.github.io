import Foundation

struct Money: Codable {
    let money: Double
}

struct MoneyData: Codable {
    let _id: String
    let money: Double
    let __v: Int
}

struct SearchResultResponse: Codable {
    let count: Int
    let result: [SearchResult]
}

struct SearchResult: Codable {
    let description: String
    let displaySymbol: String
    let symbol: String
    let type: String
}

struct Holding: Codable, Hashable {
    let _id: String
    let ticker: String
    let quantity: Int
    let cost: Double
    let __v: Int
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(ticker)
        hasher.combine(quantity)
    }
    
    static func == (lhs: Holding, rhs: Holding) -> Bool {
        return lhs.ticker == rhs.ticker && lhs.quantity == rhs.quantity
    }
}

struct QuoteData: Codable {
    let c: Double // Current price
    let d: Double // Change in price
    let dp: Double // Percentage change in price
    let h: Double // High price
    let l: Double // Low price
    let o: Double // Opening price
    let pc: Double // Previous closing price
    let t: Int // Time of last trade
}

struct HourlyData: Codable {
    let ticker: String
    let results: [HourlyResult]
}

struct HourlyResult: Codable {
    let t: Int // Time
    let c: Double // Closing price
}

struct Favorite: Codable {
    let _id: String
    let ticker: String
    let name: String
    let __v: Int
}

struct InsiderData: Codable {
    let mspr: Double
    let change: Double
}

struct InsiderResponse: Codable {
    let data: [InsiderData]
}

struct TrendData: Codable {
    let period: String
    let strongBuy: Int
    let buy: Int
    let hold: Int
    let sell: Int
    let strongSell: Int
}

struct EarningsData: Codable {
    let actual: Double
    let estimate: Double
    let period: String
    let quarter: Int
    let surprise: Double
    let surprisePercent: Double
    let symbol: String
    let year: Int
}

struct CompanyProfile: Codable {
    let ticker: String
    let name: String
    let logo: String
    let country: String
    let currency: String
    let estimateCurrency: String
    let exchange: String
    let finnhubIndustry: String
    let ipo: String
    let marketCapitalization: Double
    let phone: String
    let shareOutstanding: Double
    let weburl: String
}
struct HistoricalData: Codable {
    let ticker: String
    let queryCount: Int
    let resultsCount: Int
    let adjusted: Bool
    let results: [HistoricalResult]
}

struct HistoricalResult: Codable {
    let v: Int // Volume
    let vw: Double // Volume Weighted
    let o: Double // Open
    let c: Double // Close
    let h: Double // High
    let l: Double // Low
    let t: Int // Time
    let n: Int
}

struct NewsArticle: Codable, Hashable {
    let source: String?
    let url: String?
    let image: String?
    let datetime: Int?
    let headline: String?
    let summary: String?
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(source)
        hasher.combine(url)
        hasher.combine(image)
        hasher.combine(datetime)
        hasher.combine(headline)
        hasher.combine(summary)
    }
    
    static func ==(lhs: NewsArticle, rhs: NewsArticle) -> Bool {
        return lhs.source == rhs.source &&
        lhs.url == rhs.url &&
        lhs.image == rhs.image &&
        lhs.datetime == rhs.datetime &&
        lhs.headline == rhs.headline &&
        lhs.summary == rhs.summary
    }
}


