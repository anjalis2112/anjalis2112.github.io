import SwiftUI
import Kingfisher
import WebKit


struct StockDetails: View {
    @State private var isLoading = true
    @State private var stockData: CompanyProfile?
    @State private var quoteData: QuoteData?
    @Binding var portfolio: [Holding]
    @State private var peers: [String] = []
    @State private var chartHTML: String = ""
    @State private var historicalChartHTML: String = ""
    @State private var recommendChartHTML: String = ""
    @State private var surpriseChartHTML: String = ""
    @State private var showTradeView = false
    @State private var availableAmount: Double = 0
    @State private var navigateToFirstPage = false
    @State private var insiderData: InsiderResponse?
    @State private var trendData: [TrendData] = []
    @State private var earningData: [EarningsData] = []
    @State private var news: [NewsArticle] = []
    @State private var isNewsDetailPresented = false
    @State private var selectedNews: NewsArticle? = nil
    @State private var showHourlyChart = true
    @Binding var favorites: [Favorite]
    @State private var isFavorite = false
    @State private var showToast: Bool = false
    @State private var toastMessage: String = ""
    @State private var isNavBarHidden: Bool = false
    let symbol: String
    var body: some View {
        
        
        ZStack(alignment: .bottom) {  ScrollView {
            VStack(alignment: .leading) {
                
                Spacer() // Pushes the ProgressView to the center vertically
                
                if isLoading {
                    ProgressView("Fetching Data...")
                        .foregroundColor(.gray)
                        .padding(.top, 300)
                }
                
                else {
                    if let stock = stockData, let quote = quoteData {
                        // Display fetched data
                        HStack {
                            // Display ticker and name vertically
                            VStack(alignment: .leading, spacing: 10) {
                                Text(stock.ticker)
                                    .bold()
                                    .font(.system(size: 45))
                                Text(stock.name)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                            
                            
                            Spacer() // Add Spacer to push logo to the rightmost side
                            
                            // Display logo
                            if let logoURL = URL(string: stock.logo) {
                                AsyncImage(url: logoURL) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 80, height: 80)
                                        .cornerRadius(10)
                                }
                                .padding()
                            }
                        }
                        .padding([.leading, .trailing], 20) // Add padding on both sides
                        
                        // Display quote data
                        HStack {
                            Text(String(format: "$%.2f", quote.c))
                                .font(.system(size: 30, weight: .bold))
                                .foregroundColor(.black)
                            
                            Image(systemName: quote.dp > 0 ? "arrow.up.right" : "arrow.down.right")
                                .foregroundColor(quote.dp > 0 ? .green : .red)
                            
                            Text(String(format: "$%.2f", quote.d))
                                .foregroundColor(quote.dp > 0 ? .green : .red)
                            
                            Text("(\(String(format: "%.2f%%", quote.dp)))")
                                .foregroundColor(quote.dp > 0 ? .green : .red)
                            
                            
                        }.padding()
                        
                        if showHourlyChart {
                            if !chartHTML.isEmpty {
                                WebView(htmlString: chartHTML)
                                    .frame(height: 360)
                                Divider()
                            }
                        } else {
                            if !historicalChartHTML.isEmpty {
                                
                                WebView(htmlString: historicalChartHTML)
                                    .frame(height: 360)
                                Divider()
                            }
                        }
                        
                        HStack {
                            Spacer()
                            Button(action: {
                                showHourlyChart = true
                            }) {
                                VStack{Image(systemName: "chart.xyaxis.line")
                                        .foregroundColor(showHourlyChart ? .blue : .gray)
                                        .font(.system(size: 30))
                                    Text("Hourly")
                                        .font(.system(size: 14))
                                    .foregroundColor(.gray)}
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                showHourlyChart = false
                            }) {
                                VStack{Image(systemName: "clock.fill")
                                        .foregroundColor(showHourlyChart ? .gray : .blue)
                                        .font(.system(size: 30))
                                    Text("Historical")
                                        .font(.system(size: 14))
                                    .foregroundColor(.gray)}
                            }
                            
                            .padding()
                            Spacer()
                        }
                        
                        
                        
                        HStack{if let holding = portfolio.first(where: { $0.ticker.lowercased() == symbol.lowercased() }) {
                            let marketValue = quote.c * Double(holding.quantity)
                            let change = quote.c - (holding.cost / Double(holding.quantity))
                            let changeColor: Color = change > 0 ? .green : (change < 0 ? .red : .gray)
                            let marketValueColor: Color = marketValue > Double(holding.cost) ? .green : (marketValue < Double(holding.cost) ? .red : .gray)
                            
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Portfolio")
                                    .font(.system(size: 24))
                                
                                Text("Shares Owned: ")
                                    .bold()
                                    .font(.system(size: 14))
                                + Text("\(holding.quantity)")
                                    .font(.system(size: 14))
                                
                                Text("Avg. Cost/Share: ")
                                    .bold()
                                    .font(.system(size: 14))
                                + Text("$\(String(format: "%.2f", quote.c))")
                                    .font(.system(size: 14))
                                
                                Text("Total Cost: ")
                                    .bold()
                                    .font(.system(size: 14))
                                + Text("$\(String(format: "%.2f", holding.cost))")
                                    .font(.system(size: 14))
                                
                                Text("Change: ")
                                    .bold()
                                    .font(.system(size: 14))
                                + Text("$\(String(format: "%.2f", change))")
                                    .foregroundColor(changeColor)
                                    .font(.system(size: 14))
                                
                                Text("Market Value: ")
                                    .bold() // Make this part bold
                                    .font(.system(size: 14))
                                + Text("$\(String(format: "%.2f", marketValue))")
                                    .foregroundColor(marketValueColor)
                                    .font(.system(size: 14))
                            }
                            .padding()
                        }
                            else{
                                VStack(alignment: .leading, spacing: 15){
                                    Text("Portfolio")
                                        .font(.system(size: 24))
                                    Text("You have 0 shares of \(stockData?.ticker ?? "" ).")
                                        .font(.system(size: 14))
                                    Text("Start trading!") .font(.system(size: 14))}.padding()
                                
                            }
                            
                            Button(action: {
                                // Show TradeView sheet
                                self.showTradeView.toggle()
                            }) {
                                Text("Trade")
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 40)
                                    .padding(.vertical, 10)
                                    .background(Color.green)
                                    .cornerRadius(30)
                            }
                            .sheet(isPresented: $showTradeView) {
                                TradeView(
                                    showTradeView: $showTradeView,
                                    stockName: stockData?.name ?? "", stockTicker: stockData?.ticker ?? "",
                                    availableAmount: availableAmount,
                                    stockData: stockData,
                                    quoteData: quoteData,
                                    portfolio: $portfolio
                                )
                            }.padding(.horizontal, 20)
                        }.padding(.bottom, -20)
                        
                        VStack(alignment: .leading, spacing: 10) {
                            VStack(alignment: .leading, spacing: 10){
                                Text("Stats")
                                    .font(.system(size: 24))
                                
                                HStack {
                                    Text("High:")
                                        .bold()
                                        .font(.system(size: 14))
                                    Text(String(format: "$%.2f", quote.h))
                                        .font(.system(size: 14))
                                    Spacer().frame(width: 50)
                                    Text("Open:")
                                        .bold()
                                        .font(.system(size: 14))
                                    Text(String(format: "$%.2f", quote.o))
                                        .font(.system(size: 14))
                                }
                                
                                HStack {
                                    Text("Low:")
                                        .bold()
                                        .font(.system(size: 14))
                                    Text(String(format: "$%.2f", quote.l))
                                        .font(.system(size: 14))
                                    Spacer().frame(width: 55)
                                    Text("Prev. Close:")
                                        .bold()
                                        .font(.system(size: 14))
                                    Text(String(format: "$%.2f", quote.pc))
                                        .font(.system(size: 14))
                                }}.padding(.bottom, 5)
                            
                            VStack(alignment: .leading, spacing: 10) {
                                Text("About")
                                    .font(.system(size: 24))
                                
                                KeyValueRow(title: "IPO Start Date", value: stock.ipo)
                                KeyValueRow(title: "Industry", value: stock.finnhubIndustry)
                                KeyValueRow(title: "Webpage", value: stock.weburl)
                                
                                // Company Peers with horizontal scrolling
                                HStack {
                                    Text("Company Peers:")
                                        .bold()
                                        .font(.system(size: 14))
                                        .frame(width: 120, alignment: .leading)
                                    Spacer().frame(width: 60)
                                    ScrollView(.horizontal, showsIndicators: true) {
                                        HStack(spacing: 10) {
                                            ForEach(peers, id: \.self) { peer in
                                                NavigationLink(destination: StockDetails(portfolio: $portfolio, favorites: $favorites,symbol: peer )) {
                                                    Text(peer)
                                                        .font(.system(size: 14))
                                                }
                                            }
                                        }.navigationBarTitle(Text(stockData!.ticker).foregroundColor(.clear), displayMode: .inline)
                                    }
                                }
                            }.padding(.bottom, 5)
                            
                            Text("Insights")
                                .font(.system(size: 24))
                            
                            let totalMSPR = String(format: "%.2f", insiderData?.data.reduce(0, { $0 + $1.mspr }) ?? 0)
                            let positiveMSPR = String(format: "%.2f", insiderData?.data.filter({ $0.mspr > 0 }).reduce(0, { $0 + $1.mspr }) ?? 0)
                            let negativeMSPR = String(format: "%.2f", insiderData?.data.filter({ $0.mspr < 0 }).reduce(0, { $0 + $1.mspr }) ?? 0)
                            
                            let totalChange = String(format: "%.2f", insiderData?.data.reduce(0, { $0 + $1.change }) ?? 0)
                            let positiveChange = String(format: "%.2f", insiderData?.data.filter({ $0.change > 0 }).reduce(0, { $0 + $1.change }) ?? 0)
                            let negativeChange = String(format: "%.2f", insiderData?.data.filter({ $0.change < 0 }).reduce(0, { $0 + $1.change }) ?? 0)
                            
                            // Table with calculated values
                            VStack(alignment: .center, spacing: 10) {
                                Text("Insider Sentiments")
                                    .font(.title2)
                                    .padding(.bottom, 10)
                                HStack {
                                    Text("\(stockData?.name ?? "") ").bold().frame(width: 100)
                                    Text("MSPR").bold().frame(width: 100)
                                    Text("Change").bold().frame(width: 100)
                                }
                                .padding(.horizontal)
                                Divider()
                                
                                // Total row
                                HStack {
                                    Text("Total").bold().frame(width: 100)
                                    Text("\(totalMSPR)").frame(width: 100)
                                    Text("\(totalChange)").frame(width: 120)
                                }
                                .padding(.horizontal)
                                Divider()
                                
                                // Positive row
                                HStack {
                                    Text("Positive").bold().frame(width: 100)
                                    Text("\(positiveMSPR)").frame(width: 100)
                                    Text("\(positiveChange)").frame(width: 120)
                                }
                                .padding(.horizontal)
                                Divider()
                                
                                // Negative row
                                HStack {
                                    Text("Negative").bold().frame(width: 100)
                                    Text("\(negativeMSPR)").frame(width: 100)
                                    Text("\(negativeChange)").frame(width: 120)
                                }
                                .padding(.horizontal)
                                Divider()
                            }
                            .padding(.horizontal, 1)
                            
                            if !recommendChartHTML.isEmpty {
                                WebView(htmlString: recommendChartHTML)
                                    .frame(height: 400)
                                
                            }
                            
                            if !surpriseChartHTML.isEmpty {
                                WebView(htmlString: surpriseChartHTML)
                                    .frame(height: 350)
                                    .padding(.top, -20)
                                
                            }
                            Text("News")
                                .font(.system(size: 24))
                            NewsView(news: self.news)
                            
                            
                        }
                        .padding()
                        
                        
                    }
                };Spacer()
                
                
            }
        }
            if showToast {
                if !isFavorite{
                    ToastView(message: "Removing \(stockData?.ticker ?? "") from Favorites")
                        .onAppear {
                            // Hide the toast after 2 seconds
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                showToast = false
                            }
                        }
                    
                }
                else {
                    ToastView(message: "Adding \(stockData?.ticker ?? "") to Favorites")
                        .onAppear {
                            // Hide the toast after 2 seconds
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                showToast = false
                            }
                        }
                    
                }
                
            }}
        
        
        .navigationBarItems(trailing:
                                Button(action: {
            self.showToast = true
            toggleFavorite(stockData?.ticker ?? "", name: stockData?.name ?? "")
        }) {
            Image(systemName: isFavorite ? "plus.circle.fill" : "plus.circle")
                .foregroundColor(isFavorite ? .blue : .blue)
                .background(isFavorite ? .clear : .clear) // Adjust background as needed
                .font(.system(size: 20))
                .padding()
        })
        .onAppear {
            // Call fetchData when view appears
            fetchData()
            fetchAvailableAmount()
            
        }
    }
    
    
    
    private var favoriteColor: Color {
        if isFavorite {
            return .blue
        } else {
            return .white
        }
    }
    
    private var favoriteBackground: Color {
        if isFavorite {
            return .white
        } else {
            return .white
        }
    }
    
    private func toggleFavorite(_ ticker: String, name: String) {
        print(self.showToast)
        self.isFavorite = !self.isFavorite
        // Prepare the request body
        let requestBody: [String: String] = [
            "ticker": ticker,
            "name": name
        ]
        
        // Convert the request body to JSON data
        guard let jsonData = try? JSONSerialization.data(withJSONObject: requestBody) else {
            print("Error encoding request body")
            return
        }
        
        // Prepare the URL and request
        let url = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/favorites")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = jsonData
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Perform the request
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error toggling favorite: \(error)")
                return
            }
            guard let httpResponse = response as? HTTPURLResponse else {
                print("Invalid response")
                return
            }
            if httpResponse.statusCode == 200 || httpResponse.statusCode == 201{
                
                guard let favURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/favorites") else { return }
                
                URLSession.shared.dataTask(with: favURL) { data, _, error in
                    
                    guard let data = data else {
                        print("Error: \(error?.localizedDescription ?? "Unknown error")")
                        return
                    }
                    
                    if let decodedResponse = try? JSONDecoder().decode([Favorite].self, from: data) {
                        DispatchQueue.main.async {
                            //                                                     self.favorites = decodedResponse
                        }
                    } else {
                        print("Error: Failed to decode favorites JSON.")
                    }
                }.resume()
                
            }
        }.resume()
    }
    
    func fetchAvailableAmount() {
        guard let url = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/money") else { return }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            guard let data = data else {
                print("Error: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            if let moneyData = try? JSONDecoder().decode([MoneyData].self, from: data), let money = moneyData.first {
                DispatchQueue.main.async {
                    self.availableAmount = money.money // Assign fetched available amount here
                }
            } else {
                print("Error: Failed to decode available amount JSON.")
            }
        }.resume()
    }
    
    func fetchData() {
        guard let profileURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/profile/\(symbol.lowercased())") else { return }
        guard let quoteURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/quote/\(symbol.lowercased())") else { return }
        guard let peersURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/peers/\(symbol.lowercased())") else { return }
        guard let portfolioURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/holdings") else { return }
        guard let insiderURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/insider/\(symbol.lowercased())") else { return }
        guard let trendURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/trends/\(symbol.lowercased())") else { return }
        guard let earningURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/earnings/\(symbol.lowercased())") else { return }
        guard let newsURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/news/\(symbol.lowercased())") else { return }
        guard let favURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/favorites") else { return }
        
        
        let group = DispatchGroup()
        
        // Fetch profile data
        group.enter()
        URLSession.shared.dataTask(with: profileURL) { data, _, error in
            defer { group.leave() }
            guard let data = data else {
                print("Error: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            if let decodedResponse = try? JSONDecoder().decode(CompanyProfile.self, from: data) {
                DispatchQueue.main.async {
                    self.stockData = decodedResponse
                }
            } else {
                print("Error: Failed to decode profile JSON.")
            }
        }.resume()
        
        
        
        // Fetch quote data
        group.enter()
        URLSession.shared.dataTask(with: quoteURL) { data, _, error in
            defer { group.leave() }
            guard let data = data else {
                print("Error: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            if let decodedResponse = try? JSONDecoder().decode(QuoteData.self, from: data) {
                DispatchQueue.main.async {
                    self.quoteData = decodedResponse
                }
            } else {
                print("Error: Failed to decode quote JSON.")
            }
        }.resume()
        
        // Fetch portfolio data
        //    group.enter()
        //    URLSession.shared.dataTask(with: portfolioURL) { data, _, error in
        //        defer { group.leave() }
        //        guard let data = data else {
        //            print("Error: \(error?.localizedDescription ?? "Unknown error")")
        //            return
        //        }
        //        
        //        if let decodedResponse = try? JSONDecoder().decode([Holding].self, from: data) {
        //            DispatchQueue.main.async {
        //                self.portfolio = decodedResponse
        //            }
        //        } else {
        //            print("Error: Failed to decode portfolio JSON.")
        //        }
        //    }.resume()
        
        //    group.enter()
        //    URLSession.shared.dataTask(with: favURL) { data, _, error in
        //        defer { group.leave() }
        //        guard let data = data else {
        //            print("Error: \(error?.localizedDescription ?? "Unknown error")")
        //            return
        //        }
        //        
        //        if let decodedResponse = try? JSONDecoder().decode([Favorite].self, from: data) {
        //            DispatchQueue.main.async {
        //                self.favorites = decodedResponse
        //            }
        //        } else {
        //            print("Error: Failed to decode favorites JSON.")
        //        }
        //    }.resume()
        
        // Fetch peers data
        group.enter()
        URLSession.shared.dataTask(with: peersURL) { data, _, error in
            defer { group.leave() }
            guard let data = data else {
                print("Error: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            if let decodedResponse = try? JSONDecoder().decode([String].self, from: data) {
                DispatchQueue.main.async {
                    let filteredPeers = decodedResponse.filter { !$0.contains(".") }
                    self.peers = filteredPeers
                    
                }
            } else {
                print("Error: Failed to decode peers JSON.")
            }
        }.resume()
        group.enter()
        URLSession.shared.dataTask(with: newsURL) { data, _, error in
            defer { group.leave() }
            if let error = error {
                print("Error fetching news articles: \(error.localizedDescription)")
                return
            }
            
            guard let data = data else {
                print("Error: No data received from the server.")
                return
            }
            
            do {
                let decoder = JSONDecoder()
                let articles = try decoder.decode([NewsArticle].self, from: data)
                
                let filteredArticles = articles.filter { article in
                    guard let source = article.source,
                          let url = article.url,
                          let image = article.image,
                          let datetime = article.datetime,
                          let headline = article.headline,
                          let summary = article.summary else {
                        return false
                    }
                    
                    return !source.isEmpty &&
                    !url.isEmpty &&
                    !image.isEmpty &&
                    !headline.isEmpty &&
                    !summary.isEmpty
                }.prefix(20)
                
                DispatchQueue.main.async {
                    self.news = Array(filteredArticles)
                }
                
            } catch {
                print("Error decoding news articles: \(error.localizedDescription)")
                
            }
        }.resume()
        
        
        group.enter()
        URLSession.shared.dataTask(with: insiderURL) { data, _, _ in
            defer { group.leave() }
            if let data = data {
                self.insiderData = try? JSONDecoder().decode(InsiderResponse.self, from: data)
            }
            
        }.resume()
        
        // Fetch recommendation trends data
        group.enter()
        URLSession.shared.dataTask(with: trendURL) { data, _, _ in
            defer { group.leave() }
            if let data = data {
                do {
                    self.trendData = try JSONDecoder().decode([TrendData].self, from: data)
                    
                } catch {
                    print("Error decoding trend data: \(error)")
                }
            }
        }.resume()
        
        
        group.enter()
        URLSession.shared.dataTask(with: earningURL) { data, _, _ in
            defer { group.leave() }
            if let data = data {
                do {
                    self.earningData = try JSONDecoder().decode([EarningsData].self, from: data)
                    
                } catch {
                    print("Error decoding earnings data: \(error)")
                }
            }
        }.resume()
        
        
        // Notify when profile, quote, portfolio, and peers data fetching are completed
        group.notify(queue: .main) {
            self.createRecommendChart()
            self.createSurpriseChart()
            if favorites.contains(where: { $0.ticker == stockData?.ticker }){
                self.isFavorite = true
            }
            else{
                self.isFavorite = false
            }
            self.isLoading = false
            // Fetch historical and hourly data
            self.fetchHistoricalData()
            self.fetchHourlyData()
        }
    }
    
    func fetchHistoricalData() {
        guard let historicalURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/history/\(symbol.uppercased())") else { return }
        
        URLSession.shared.dataTask(with: historicalURL) { data, _, error in
            guard let data = data else {
                print("Error: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            if let decodedResponse = try? JSONDecoder().decode(HistoricalData.self, from: data) {
                DispatchQueue.main.async {
                    self.createHistoricalHighcharts(historicalData: decodedResponse)
                }
            } else {
                print("Error: Failed to decode historical data JSON.")
            }
        }.resume()
    }
    
    func fetchHourlyData() {
        guard let hourlyURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/hourly/\(symbol.uppercased())") else { return }
        
        URLSession.shared.dataTask(with: hourlyURL) { data, _, error in
            guard let data = data else {
                print("Error: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            if let hourlyData = try? JSONDecoder().decode(HourlyData.self, from: data) {
                DispatchQueue.main.async {
                    self.createHighcharts(hourlyData: hourlyData)
                }
            } else {
                print("Error: Failed to decode hourly data JSON.")
            }
        }.resume()
    }
    
    func createSurpriseChart() {
        let periods = self.earningData.map { "\($0.period)" }
        let actual = self.earningData.map { "\($0.actual)" }
        let estimate = self.earningData.map { "\($0.estimate)" }
        let surprise = self.earningData.map { "\($0.surprise)" }
        
        let actualDataString = actual.joined(separator: ", ")
        let estimateDataString = estimate.joined(separator: ", ")
        let surpriseDataString = surprise.joined(separator: ", ")
        
        // Construct Highchart options JSON
        let surpriseOptionsJSON = """
        {
            chart: {
                type: 'spline',
                backgroundColor: 'white',
            },
            title: {
                text: 'Historical EPS Surprises',
                style: {
                    fontSize: '45px' // Set title font size
                }
            },
            xAxis: {
                categories: \(periods),
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '30px' // Set X-axis labels font size
                    },
                    useHTML: true,
                    formatter: function () {
                        let surpriseValue = [\(surpriseDataString)][this.pos];
                        return '<div style="text-align: center;">' + this.value + '<br><span>Surprise: ' + surpriseValue + '</span></div>';
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Quantity EPS',
                    style: {
                        fontSize: '25px'
                    }
                },
                labels: {
                    style: {
                        fontSize: '25px'
                    }
                }
            },
            legend: {
                symbolHeight: 20, // Increase symbol height
                symbolWidth: 20, // Increase symbol width
                itemStyle: {
                    fontSize: '30px' // Set legend item font size
                }
            },
                    tooltip: {
                            style: {
                                fontSize: '30px' // Set tooltip font size
                            }
                        },
            series: [{
                name: 'Actual',
                data: [\(actualDataString)],
                type: 'spline',
            }, {
                name: 'Estimate',
                data: [\(estimateDataString)],
                type: 'spline',
            }]
        }
        """
        
        surpriseChartHTML = """
        <html>
        <head>
            <script src="https://code.highcharts.com/stock/highstock.js"></script>
            <script src="https://code.highcharts.com/stock/modules/drag-panes.js"></script>
            <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
            <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
            <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
            <script src="https://code.highcharts.com/modules/accessibility.js"></script>
            <script src="https://code.highcharts.com/highcharts.js"></script>
            <script src="https://code.highcharts.com/stock/modules/stock.js"></script>
            <style>
                #recommend-chart-container {
                    width: 100%;
                    height: 900px;
                }
            </style>
        </head>
        <body>
            <div id="recommend-chart-container"></div>
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    Highcharts.chart('recommend-chart-container', \(surpriseOptionsJSON));
                });
            </script>
        </body>
        </html>
        """
    }
    
    
    func createRecommendChart() {
        var period: [String] = []
        var strongBuy: [Int] = []
        var buy: [Int] = []
        var hold: [Int] = []
        var sell: [Int] = []
        var strongSell: [Int] = []
        
        // Populate data from trendData
        if !self.trendData.isEmpty {
            for trend in self.trendData {
                period.append(trend.period)
                strongBuy.append(trend.strongBuy)
                buy.append(trend.buy)
                hold.append(trend.hold)
                sell.append(trend.sell)
                strongSell.append(trend.strongSell)
            }
        }
        
        // Construct Highchart options JSON
        let recommendOptionsJSON = """
        {
            chart: {
                type: 'column',
                backgroundColor: 'white',
            },
            title: {
                text: 'Recommendation Trends',
                style: {
                    fontSize: '45px' // Set title font size
                }
            },
            xAxis: {
                categories: \(period),
                labels: {
                    style: {
                        fontSize: '30px' // Set X-axis labels font size
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: '#Analysis',
                    style: {
                        fontSize: '25px' // Set Y-axis title font size
                    }
                },
                labels: {
                    style: {
                        fontSize: '25px' // Set Y-axis labels font size
                    }
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '30px',
                            color: 'white'
                        }
                    }
                }
            },
            legend: {
                symbolHeight: 20, // Increase symbol height
                symbolWidth: 20, // Increase symbol width
                itemStyle: {
                    fontSize: '30px' // Set legend item font size
                },
            },
            tooltip: {
                    style: {
                        fontSize: '30px' // Set tooltip font size
                    }
                },
            series: [{
                name: 'Strong Buy',
                data: \(strongBuy),
                type: 'column',
                color: 'darkgreen',
            }, {
                name: 'Buy',
                data: \(buy),
                type: 'column',
                color: 'green',
            }, {
                name: 'Hold',
                data: \(hold),
                type: 'column',
                color: '#B07E28',
            }, {
                name: 'Sell',
                data: \(sell),
                type: 'column',
                color: 'red',
            }, {
                name: 'Strong Sell',
                data: \(strongSell),
                type: 'column',
                color: 'darkred',
            }],
        }
        """
        
        // Set recommendChartHTML to Highchart HTML
        recommendChartHTML = """
        <html>
        <head>
                                    <script src="https://code.highcharts.com/stock/highstock.js"></script>
                                    <script src="https://code.highcharts.com/stock/modules/data.js"></script>
                                    <script src="https://code.highcharts.com/stock/highcharts-more.js"></script>
                                    <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
                                    <script src="https://code.highcharts.com/stock/modules/export-data.js"></script>
                                    <script src="https://code.highcharts.com/stock/modules/accessibility.js"></script>
                                    <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
                                       <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
            <style>
                #recommend-chart-container {
                    width: 100%;
                    height: 900px;
                }
            </style>
        </head>
        <body>
            <div id="recommend-chart-container"></div>
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    Highcharts.chart('recommend-chart-container', \(recommendOptionsJSON));
                });
            </script>
        </body>
        </html>
        """
    }
    
    
    
    func createHistoricalHighcharts(historicalData: HistoricalData) {
        var ohlcData = "["
        var volumeData = "["
        
        for result in historicalData.results {
            ohlcData += "[\(result.t), \(result.o), \(result.h), \(result.l), \(result.c)],"
            volumeData += "[\(result.t), \(result.v)],"
        }
        
        // Remove the trailing comma and close the OHLC and volume data arrays
        ohlcData.removeLast()
        volumeData.removeLast()
        ohlcData += "]"
        volumeData += "]"
        
        let historicalOptionsJSON = """
            {
                "rangeSelector": {
                    "buttons": [{
                        "type": "month",
                        "count": 1,
                        "text": "1m",
                        "style": {
                        "fontSize": "30px"
                        }
                    }, {
                        "type": "month",
                        "count": 3,
                        "text": "3m",
                        "style": {
                        "fontSize": "30px"
                        }
                    }, {
                        "type": "month",
                        "count": 6,
                        "text": "6m",
                        "style": {
                        "fontSize": "30px"
                        }
                    }, {
                        "type": "ytd",
                        "text": "YTD",
                        "style": {
                        "fontSize": "30px"
                        }
                    }, {
                        "type": "year",
                        "count": 1,
                        "text": "1Y",
                        "style": {
                        "fontSize": "30px"
                        }
                    }, {
                        "type": "all",
                        "text": "All",
                        "style": {
                        "fontSize": "30px"
                        }
                    }],
                    "selected": 2,
                    "dropdown": "always"
                },
                "title": { "text": "\(historicalData.ticker) Historical" , style: {
                        fontSize: '45px'
                    }},
                "subtitle": { "text": "With SMA and Volume by Price technical indicators" ,style: {
                        fontSize: '30px'
                    }},
                        legend: {
                            symbolHeight: 20,
                            symbolWidth: 20,
                            itemStyle: {
                                fontSize: '30px'
                            },
                        },
                "xAxis": {
                            labels: {
                                style: {
                                    fontSize: '20px'
                                }
                            },
                    "type": "datetime",
                    "tickInterval": 28 * 24 * 3600 * 1000
                },
                                                    yAxis: [{
                                                startOnTick: false,
                                                endOnTick: false,
                                                        labels: {
                                                            align: 'right',
                                                            x: -3,
                                style: {
                                    fontSize: '25px'}
                                                        },
                                                        title: {
                                                            text: 'OHLC',
                                style: {
                                    fontSize: '25px'}
                                                        },
                                                        height: '60%',
                                                        lineWidth: 2,
                                                        resize: {
                                                            enabled: true
                                                        }
                                                    }, {
                                                        labels: {
                                                            align: 'right',
                                                            x: -3,
                                style: {
                                    fontSize: '25px'}
                                                        },
                                                        title: {
                                                            text: 'Volume',
                                style: {
                                    fontSize: '25px'}
                                                        },
                                                        top: '65%',
                                                        height: '35%',
                                                        offset: 0,
                                                        lineWidth: 2
                                                    }],
                                                    tooltip: {
                                                        split: true,
                                style: {
                                    fontSize: '30px'
                                }
                                                    },
                                                    chart: {
                                                        backgroundColor: 'white',
                                                    },
                                                    series: [{
                                                        type: 'candlestick',
                                                        name: '\(historicalData.ticker)',
                                                        id: '\(historicalData.ticker)',
                                                        zIndex: 2,
                                                        data: \(ohlcData)
                                                    }, {
                                                        type: 'column',
                                                        name: 'Volume',
                                                        id: 'volume',
                                                        data: \(volumeData),
                                                        yAxis: 1
                                                    }, {
                                                        type: 'vbp',
                                                        linkedTo: '\(historicalData.ticker)',
                                                        params: {
                                                            volumeSeriesID: 'volume'
                                                        },
                                                        dataLabels: {
                                                            enabled: false
                                                        },
                                                        zoneLines: {
                                                            enabled: false
                                                        }
                                                    }, {
                                                        type: 'sma',
                                                        linkedTo: '\(historicalData.ticker)',
                                                        zIndex: 1,
                                                        marker: {
                                                            enabled: false
                                                        }
                                                    }],
                                                    time: {
                                                        useUTC: false,
                                                        timezone: 'America/Los_Angeles'
                                                    }
            }
            """
        
        let historicalChartScript = """
            <script>
            document.addEventListener("DOMContentLoaded", function() {
                Highcharts.stockChart('historical-chart-container', \(historicalOptionsJSON));
            });
            </script>
            """
        
        historicalChartHTML = """
            <html>
            <head>
              <script src="https://code.highcharts.com/stock/highstock.js"></script>
              <script src="https://code.highcharts.com/stock/modules/drag-panes.js"></script>
              <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
              <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
              <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
              <script src="https://code.highcharts.com/modules/accessibility.js"></script>
              <script src="https://code.highcharts.com/highcharts.js"></script>
              <script src="https://code.highcharts.com/stock/modules/stock.js"></script>
                                    <style>
                                        #historical-chart-container {
                                            width: 100%;
                                            height: 900px;
                                        }
            select[aria-label="Zoom"] {
              width: 120px; /* Increase width */
              height: 60px; /* Increase height */
              padding: 10px; /* Adjust padding */
            }
                                    </style>
            </head>
            <body>
            <div id="historical-chart-container"></div>
            \(historicalChartScript)
            </body>
            </html>
            """
        
    }
    
    
    
    
    func createHighcharts(hourlyData: HourlyData) {
        var priceData = [(Double, Double)]()
        
        // Iterate over hourlyData.results in reverse order
        for result in hourlyData.results.reversed() {
            // Construct tuple of timestamp and price
            let tuple = (Double(result.t), result.c)
            // Add tuple to the beginning of priceData array
            priceData.insert(tuple, at: 0)
            // Break the loop if priceData length exceeds 32
            if priceData.count >= 32 {
                break
            }
        }
        
        // Construct dataString from priceData
        var dataString = ""
        for tuple in priceData {
            dataString += "[\(tuple.0), \(tuple.1)],"
        }
        // Determine line color based on change
        let lineColor: String = quoteData?.d ?? 0 > 0 ? "green" : "red"
        
        // Construct Highcharts options object
        let optionsJSON = """
            {
                "colors": ["\(lineColor)"],
                "rangeSelector": {
                    "enabled": false
                },
                "navigator": {
                    "enabled": false
                },
                "title": {
                    "text": "\(hourlyData.ticker) Hourly Price Variation",
                        style: {
                                fontSize: '45px',
                                "color": "gray"
                            }
                   
                },
                "xAxis": {
                                    labels: {
                                        style: {
                                            fontSize: '20px'
                                        }
                                    },
                    "type": "datetime",
                    "tickInterval": 6 * 60 * 60 * 1000
                },
                "series": [{
                    "name": "\(hourlyData.ticker)",
                    "data": [\(dataString)],
                    "type": "line"
                }],
                "tooltip": {
                    "split": true,
                        style: {
                            fontSize: '20px' // Set tooltip font size
                        }
                },
                "time": {
                    "useUTC": false,
                    "timezone": "America/Los_Angeles"
                },
                "legend": {
                    "enabled": false
                },
                "chart": {
                    "backgroundColor": "white"
                }
            }
        """
        
        // Create Highcharts chart with options
        let chartScript = """
            <script>
            document.addEventListener("DOMContentLoaded", function() {
                Highcharts.stockChart('chart-container', \(optionsJSON));
            });
            </script>
        """
        
        // Combine chart HTML with chartScript
        chartHTML = """
            <html>
            <head>
            <script src="https://code.highcharts.com/stock/highstock.js"></script>
            <script src="https://code.highcharts.com/stock/modules/data.js"></script>
                    <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
                    <script src="https://code.highcharts.com/stock/modules/export-data.js"></script>
                    <script src="https://code.highcharts.com/stock/modules/accessibility.js"></script>
        <style>
                                                #chart-container {
                                                    width: 100%;
                                                    height: 900px;
                                                }</style>
            </head>
            <body>
            <div id="chart-container"></div>
            \(chartScript)
            </body>
            </html>
        """
    }
    
    struct KeyValueRow: View {
        let title: String
        let value: String
        
        var body: some View {
            HStack {
                Text("\(title):")
                    .bold()
                    .font(.system(size: 14))
                    .frame(width: 120, alignment: .leading)
                Spacer().frame(width: 60)
                if title == "Webpage" {
                    Button(action: {
                        // Open the URL in a browser
                        if let url = URL(string: value) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        Text(value)
                            .font(.system(size: 14)) // Reduce font size
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                } else {
                    Text(value)
                        .font(.system(size: 14)) // Reduce font size
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
    }
    struct NewsView: View {
        var news: [NewsArticle]
        @State private var selectedArticle: NewsArticle?
        @State private var isShowingDetail = false
        
        var body: some View {
            ScrollView {
                VStack(spacing: 20) {
                    if let firstNews = news.first {
                        FirstNewsView(news: firstNews)
                            .onTapGesture {
                                self.selectedArticle = firstNews
                                self.isShowingDetail = true
                            }
                    }
                    
                    ForEach(news.dropFirst(), id: \.self) { article in
                        NewsRow(article: article)
                            .onTapGesture {
                                self.selectedArticle = article
                                self.isShowingDetail = true
                            }.padding(.bottom, 5)
                    }
                }
                .padding()
                .onChange(of: isShowingDetail) { newValue in
                    if !newValue {
                        selectedArticle = nil
                    }
                }
                .sheet(isPresented: $isShowingDetail) {
                    if let selectedArticle = selectedArticle {
                        NewsDetailView(article: selectedArticle) {
                            self.isShowingDetail = false
                            self.selectedArticle = nil
                        }
                    }
                }
            }
        }
    }
    
    struct FirstNewsView: View {
        var news: NewsArticle
        
        var body: some View {
            VStack(alignment: .leading, spacing: 10) {
                KFImage(URL(string: news.image ?? ""))
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(maxHeight: 250)
                    .cornerRadius(8)
                    .clipped()
                
                HStack {
                    Text(news.source ?? "")
                        .font(.caption)
                        .foregroundColor(.gray)
                        .bold()
                    
                    
                    if let timestamp = news.datetime {
                        Text("\(timeDifference(from: timestamp))")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                
                Text(news.headline ?? "")
                    .font(.system(size: 20))
                    .fontWeight(.bold)
                
                Divider()
            }
        }
        
        func timeDifference(from timestamp: Int) -> String {
            let currentTime = Int(Date().timeIntervalSince1970)
            let difference = currentTime - timestamp
            let minutes = difference / 60
            let hours = minutes / 60
            let remainingMinutes = minutes % 60
            
            if hours > 0 {
                if remainingMinutes > 0 {
                    return "\(hours) hr, \(remainingMinutes) min"
                } else {
                    return "\(hours) hr"
                }
            } else {
                return "\(minutes) min"
            }
        }
    }
    
    struct NewsRow: View {
        var article: NewsArticle
        
        var body: some View {
            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 5) {
                    HStack{
                        Text(article.source ?? "")
                            .font(.caption)
                            .foregroundColor(.gray)
                            .bold()
                        
                        if let timestamp = article.datetime {
                            Text("\(timeDifference(from: timestamp))")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }}
                    
                    Text(article.headline ?? "")
                        .bold()
                }
                Spacer()
                KFImage(URL(string: article.image ?? ""))
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 80, height: 80)
                    .cornerRadius(8)
            }
        }
        func timeDifference(from timestamp: Int) -> String {
            let currentTime = Int(Date().timeIntervalSince1970)
            let difference = currentTime - timestamp
            let minutes = difference / 60
            let hours = minutes / 60
            let remainingMinutes = minutes % 60
            
            if hours > 0 {
                if remainingMinutes > 0 {
                    return "\(hours) hr, \(remainingMinutes) min"
                } else {
                    return "\(hours) hr"
                }
            } else {
                return "\(minutes) min"
            }
        }
    }
    
    struct NewsDetailView: View {
        var article: NewsArticle
        var onClose: () -> Void
        
        var body: some View {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Spacer()
                    Button(action: {
                        onClose()
                    }) {
                        Image(systemName: "multiply")
                            .font(.title)
                            .foregroundColor(.gray) // Gray foreground color
                    }
                    .padding()
                    .clipShape(Circle())
                    
                }
                Text(article.source ?? "")
                    .font(.title)
                    .fontWeight(.bold)
                    .padding(.bottom, 5)
                
                Text(formatTimestamp(timestamp: article.datetime!))
                    .font(.caption)
                    .padding(.bottom, 10)
                
                Divider()
                Text(article.headline ?? "")
                    .font(.system(size: 20))
                    .bold()
                    .padding(.bottom, 10)
                
                Text(article.summary ?? "")
                    .font(.body)
                    .foregroundColor(.black)
                    .padding(.bottom, 10)
                
                Button(action: {
                    // Open URL when "Click Here" button is tapped
                    if let urlString = article.url, let url = URL(string: urlString) {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Text("For more details, click ")
                        .foregroundColor(.gray) // Set the text color to gray
                    + Text("here")
                        .foregroundColor(.blue) // Set the "here" text color to blue
                }
                
                HStack {
                    Button(action: {
                        // Share on another platform
                        shareOnX()
                    }) {
                        Image("x_logo") // Replace "x_logo" with your actual asset name
                            .resizable()
                            .frame(width: 40, height: 40)
                    }
                    
                    Button(action: {
                        // Share on Facebook
                        shareOnFacebook()
                    }) {
                        Image("facebook_logo") // Replace "facebook_logo" with your actual asset name
                            .resizable()
                            .frame(width: 40, height: 40)
                    }
                    
                    
                }
            }
            .padding()
            Spacer()
        }
        
        func formatTimestamp(timestamp: Int) -> String {
            let date = Date(timeIntervalSince1970: TimeInterval(timestamp))
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "MMMM dd, yyyy"
            return dateFormatter.string(from: date)
        }
        
        func shareOnFacebook() {
            if let urlString = article.url {
                let escapedString = urlString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!
                let facebookURL = URL(string: "https://www.facebook.com/sharer/sharer.php?u=\(escapedString)")!
                UIApplication.shared.open(facebookURL)
            }
        }
        
        func shareOnX() {
            if let headline = article.headline, let urlString = article.url {
                let shareString = headline.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!
                let twitterURL = URL(string: "https://twitter.com/intent/tweet?url=\(urlString)&text=\(shareString)")!
                UIApplication.shared.open(twitterURL)
            }
        }
    }
    
}



// WebView to load HTML string
struct WebView: UIViewRepresentable {
    let htmlString: String
    
    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        uiView.loadHTMLString(htmlString, baseURL: nil)
    }
}




struct AsyncImage<Content>: View where Content: View {
    @StateObject private var loader: ImageLoader
    private let content: (Image) -> Content
    
    init(url: URL, @ViewBuilder content: @escaping (Image) -> Content) {
        _loader = StateObject(wrappedValue: ImageLoader(url: url))
        self.content = content
    }
    
    var body: some View {
        if let image = loader.image {
            content(image)
        } else {
            ProgressView()
                .onAppear(perform: loader.load)
        }
    }
}

class ImageLoader: ObservableObject {
    @Published var image: Image?
    private let url: URL
    
    init(url: URL) {
        self.url = url
    }
    
    func load() {
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let data = data, let uiImage = UIImage(data: data) {
                DispatchQueue.main.async {
                    self.image = Image(uiImage: uiImage)
                }
            }
        }.resume()
    }
}


#if DEBUG
struct StockDetails_Previews: PreviewProvider {
    static var previews: some View {
        let fakePortfolio: [Holding] = [] // Populate with fake data for preview
        let fakeFavorites: [Favorite] = [] // Populate with fake data for preview
        
        return StockDetails(portfolio: .constant(fakePortfolio), favorites: .constant(fakeFavorites), symbol: "AAPL")
    }
}
#endif
