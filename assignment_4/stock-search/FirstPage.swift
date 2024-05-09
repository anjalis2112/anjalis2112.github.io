import SwiftUI

struct FirstPage: View {
    @State private var netWorth: Double?
    @State private var cashBalance: Double?
    @State private var isFetchingData = false
    @State private var isEditing = false
    @State private var text = ""
    @State private var hasFetchedData = false
    @State private var holdings: [Holding] = []
    @State private var quoteDataDictionary: [String: QuoteData] = [:]
    @State private var favorites: [Favorite] = []
    @State private var searchResults: [SearchResult] = []
    @State private var isEditingFav = false
    @State private var isSearchBarTapped = false
    @State private var totalCostVal: Double?
    @Environment(\.editMode) var editMode
    
    var body: some View {
        NavigationView {
            ScrollView {
                if isFetchingData {
                    ProgressView("Fetching Data...")
                        .foregroundColor(.gray)
                        .padding(.top, 400)
                } else {
                    if isSearchBarTapped {
                        SearchView(text: $text, searchResults: $searchResults, isSearchBarTapped: $isSearchBarTapped, holdings: $holdings, favorites: $favorites)
                            .transition(.opacity)
                            .animation(.easeInOut)
                    }
                    else{
                        VStack(alignment: .leading) {
                            // Edit button
                            HStack {
                                Spacer()
                                Button(action: {
                                    // Toggle edit mode
                                    isEditingFav.toggle()
                                }) {
                                    Text(isEditingFav ? "Done" : "Edit")
                                        .foregroundColor(.blue)
                                }
                            }
                            .padding()
                            
                            // Stocks title
                            Text("Stocks")
                                .font(.title)
                                .fontWeight(.bold)
                                .padding(.horizontal) // Adding horizontal padding to align
                            
                            // Search bar
                            HStack {
                                TextField("Search", text: $text)
                                    .padding(7)
                                    .padding(.horizontal, 25)
                                    .background(Color(.systemGray5))
                                    .cornerRadius(8)
                                    .overlay(
                                        HStack {
                                            Image(systemName: "magnifyingglass")
                                                .foregroundColor(.gray)
                                                .frame(minWidth: 0, maxWidth: .infinity, alignment: .leading)
                                                .padding(.leading, 8)
                                        }
                                    )
                                    .padding(.horizontal, 10)
                                    .onTapGesture {
                                        self.isSearchBarTapped = true
                                        
                                    }
                            }
                            
                            // Card with today's date
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.white)
                                .frame(height: 70)
                                .overlay(
                                    HStack {
                                        Text(Date().formatted(.dateTime.month(.wide).day().year()))
                                            .foregroundColor(.gray)
                                            .fontWeight(.bold)
                                            .font(.title)
                                        Spacer()
                                    }
                                        .padding(.horizontal, 10)
                                )
                                .padding()
                                .padding(.top,-10)
                            
                            // Portfolio section
                            VStack(alignment: .leading) {
                                Text("PORTFOLIO")
                                    .padding(.horizontal, 30)
                                    .foregroundColor(.gray)
                                    .font(.caption)
                                
                                
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Color.white)
                                    .frame(height: calculateCardHeight())
                                    .padding(.top, 5)
                                    .overlay(
                                        VStack(alignment: .leading){
                                            HStack(alignment: .top) {
                                                VStack(alignment: .leading) {
                                                    Text("Net Worth")
                                                        .font(.title3)
                                                    Text(String(format: "$%.2f", netWorth ?? 0))
                                                        .font(.title2)
                                                        .bold()
                                                }
                                                .padding()
                                                
                                                Spacer().frame(width: 25)
                                                
                                                VStack(alignment: .leading) {
                                                    Text("Cash Balance")
                                                        .font(.title3)
                                                    Text(String(format: "$%.2f", cashBalance ?? 0))
                                                        .font(.title2)
                                                        .bold()
                                                }
                                                .padding();
                                                
                                            }.padding();
                                            if !holdings.isEmpty {
                                                Divider()
                                                    .padding(.top, -10)
                                                    .padding(.horizontal, 15)
                                                List {
                                                    ForEach(holdings, id: \.self) { holding in
                                                        holdingRow(for: holding)
                                                    }
                                                    .onMove { indices, newOffset in
                                                        holdings.move(fromOffsets: indices, toOffset: newOffset)
                                                    }
                                                }
                                                .padding(.top, -10)
                                                .padding(.bottom, 5)
                                                .padding(.horizontal)
                                            }
                                            
                                            else{
                                                
                                            }
                                            
                                        }.padding(.top, -10))
                                    .navigationBarTitle("Stocks")
                                
                            }
                            .padding()
                            
                            VStack(alignment: .leading) {
                                Text("FAVORITES")
                                    .padding(.horizontal, 30)
                                    .foregroundColor(.gray)
                                    .font(.caption)
                                
                                
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Color.white)
                                    .frame(height: calculateFavoriteHeight())
                                    .padding(.top, 5)
                                    .overlay(
                                        VStack(alignment: .leading){
                                            if !favorites.isEmpty {
                                                VStack(spacing: 10) {
                                                    List {
                                                        ForEach(favorites, id: \.ticker) { favorite in
                                                            favoriteRow(for: favorite)
                                                        }
                                                        .onMove { indices, newOffset in
                                                            favorites.move(fromOffsets: indices, toOffset: newOffset)
                                                            
                                                        }
                                                        .onDelete { indexSet in
                                                            
                                                            deleteFavorites(at: indexSet)
                                                        }
                                                    }
                                                    .padding(.top, -5)
                                                    .padding(.bottom, 5)
                                                    .padding(.horizontal)
                                                    .environment(\.editMode, .constant(isEditingFav ? .active : .inactive))
                                                    
                                                    
                                                    
                                                }
                                            }
                                            else{
                                                
                                            }
                                            
                                        }.padding(.top, 15))
                                    .navigationBarTitle("Stocks")
                                
                                
                                Button(action: {
                                    if let url = URL(string: "https://finnhub.io") {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.white)
                                        .frame(width: 340, height: 50)
                                        .overlay(
                                            HStack {
                                                Spacer()
                                                Text("Powered by Finnhub.io")
                                                    .foregroundColor(.gray)
                                                    .fontWeight(.bold)
                                                    .font(.system(size: 15))
                                                Spacer()
                                            }
                                                .padding(.horizontal, 5)
                                        )
                                        .padding()
                                }
                                
                                
                            }
                            .padding()
                            
                            
                        }
                        .animation(.easeInOut)
                        .background(isFetchingData ? Color.white : Color(.systemGray6))
                        .navigationBarHidden(true)
                        .onAppear {
                            self.fetchFavorites()
                            self.fetchCashBalanceOnlyCashBalance()
                            self.fetchHoldings()
                            self.finalTot()
                            if !self.hasFetchedData {
                                
                                self.fetchData()
                                self.fetchQuoteDataForFavorites()
                                self.finalTot()
                                
                            }
                        }
                    }}
            }.listStyle(PlainListStyle()).background(isFetchingData ? Color.white : Color(.systemGray6))}.edgesIgnoringSafeArea(.all)
            .onChange(of: text) { searchText in
                if !searchText.isEmpty {
                    
                } else {
                    
                }
            }
        
    }
    
    private func fetchData() {
        self.isFetchingData = true
        
        fetchCashBalance()
        fetchHoldings()
        fetchFavorites()
        finalTot()
    }
    func favoriteRow(for favorite: Favorite) -> some View {
        NavigationLink(destination: StockDetails(portfolio: $holdings, favorites: $favorites,symbol: favorite.ticker )){HStack {
            VStack(alignment: .leading) {
                Text(favorite.ticker)
                    .bold()
                    .font(.system(size: 20))
                    .frame(width: 70, alignment: .leading) // Align the ticker to the leading edge
                Text("\(favorite.name)")
                    .foregroundColor(.gray)
                    .frame(width: 92, alignment: .leading) // Align the name to the leading edge
                    .font(.system(size: 13))
            }
            Spacer()
            VStack(alignment: .trailing) {
                if let quoteData = quoteDataDictionary[favorite.ticker] {
                    let priceFormat = String(format: "$%.2f", quoteData.d)
                    let percentFormat = String(format: "(%.2f%%)", quoteData.dp)
                    
                    VStack(alignment: .trailing){
                        Text(String(format: "$%.2f", quoteData.c)).bold()
                            .font(.system(size: 15))
                        
                        HStack {
                            if quoteData.d > 0 {
                                Image(systemName: "arrow.up.right")
                                    .foregroundColor(.green)
                            } else if quoteData.d < 0 {
                                Image(systemName: "arrow.down.left")
                                    .foregroundColor(.red)
                            } else {
                                Image(systemName: "minus")
                                    .foregroundColor(.gray)
                                Spacer().frame(width: 18)
                            }
                            
                            Text("\(priceFormat) \(percentFormat)")
                                .font(.system(size: 13))
                                .frame(width: 100, alignment: .trailing) // Adjust width as needed
                                .foregroundColor(quoteData.d > 0 ? .green : (quoteData.d < 0 ? .red : Color(.systemGray2)))
                        }
                    }
                } else {
                    Text("Value not available")
                }
            }
            Spacer()
            
        }}
    }
    func holdingRow(for holding: Holding) -> some View {
        NavigationLink(destination: StockDetails(portfolio: $holdings, favorites: $favorites,symbol: holding.ticker )){HStack {
            VStack(alignment: .leading) {
                Text(holding.ticker)
                    .bold()
                    .font(.system(size: 20))
                Text("\(holding.quantity) Shares")
                    .foregroundColor(.gray)
                    .font(.system(size: 15))
            }
            Spacer()
            VStack(alignment: .trailing) {
                if let quoteData = quoteDataDictionary[holding.ticker] {
                    let currentValue = Double(holding.quantity) * quoteData.c
                    let changeInPrice = quoteData.c - (holding.cost / Double(holding.quantity))
                    let changePercent = (changeInPrice / holding.cost) * 100
                    let priceFormat = String(format: "$%.2f", changeInPrice)
                    let percentFormat = String(format: "(%.2f%%)", changePercent)
                    
                    VStack(alignment: .trailing) {
                        Text(String(format: "$%.2f", currentValue)).bold()
                            .font(.system(size: 15))
                        
                        HStack {
                            if changeInPrice > 0 {
                                Image(systemName: "arrow.up.right")
                                    .foregroundColor(.green)
                            } else if changeInPrice < 0 {
                                Image(systemName: "arrow.down.left")
                                    .foregroundColor(.red)
                            } else {
                                Image(systemName: "minus")
                                    .foregroundColor(.gray)
                                Spacer().frame(width: 18)
                            }
                            Spacer().frame(width: 20)
                            Text("\(priceFormat) \(percentFormat)").font(.system(size: 15))
                                .foregroundColor(changeInPrice > 0 ? .green : (changeInPrice < 0 ? .red : Color(.systemGray2)))
                            
                        }
                        
                    }
                } else {
                    Text("Value not available")
                }
            }
            Spacer()
            
        }}
    }
    
    private func fetchSearchResults(for searchText: String) {
        let searchURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/auto/\(searchText)")!
        URLSession.shared.dataTask(with: searchURL) { data, response, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let searchResultResponse = try decoder.decode(SearchResultResponse.self, from: data)
                    let searchResults = searchResultResponse.result
                    DispatchQueue.main.async {
                        self.searchResults = searchResults.filter { !$0.symbol.contains(".") } // Filter out results with "."
                    }
                } catch {
                    print("Error decoding search results: \(error)")
                }
            }
        }.resume()
    }
    
    private func fetchCashBalance() {
        let cashBalanceURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/money")!
        URLSession.shared.dataTask(with: cashBalanceURL) { data, response, error in
            self.handleResponse(data: data, error: error) { moneyData in
                DispatchQueue.main.async {
                    self.cashBalance = moneyData?.first?.money
                    self.netWorth = moneyData?.first?.money
                }
            }
        }.resume()
    }
    
    private func fetchCashBalanceOnlyCashBalance() {
        let cashBalanceURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/money")!
        URLSession.shared.dataTask(with: cashBalanceURL) { data, response, error in
            self.handleResponse(data: data, error: error) { moneyData in
                DispatchQueue.main.async {
                    self.cashBalance = moneyData?.first?.money
                }
            }
        }.resume()
    }
    private func fetchQuoteData(for symbol: String) {
        let quoteURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/quote/\(symbol)")!
        URLSession.shared.dataTask(with: quoteURL) { data, response, error in
            if let data = data {
                do {
                    let quoteData = try JSONDecoder().decode(QuoteData.self, from: data)
                    DispatchQueue.main.async {
                        self.quoteDataDictionary[symbol] = quoteData
                    }
                } catch {
                    print("Error decoding quote data for \(symbol): \(error)")
                }
            }
        }.resume()
    }
    private func fetchQuoteDataForFavorites() {
        for favorite in favorites {
            fetchQuoteData(for: favorite.ticker)
        }
    }
    
    private func finalTot() {
        var val1: Double = 0
        var val2: Double = 0

        if let cashBalance = self.cashBalance, let totalCostVal = self.totalCostVal {
            val1 = cashBalance
            val2 = totalCostVal
            let ans = val1 + val2
            print(ans)
            self.netWorth = ans
        } else {
            let testval = self.cashBalance
            if testval ?? 0 > 0 {
                self.netWorth = testval
            }
            print("One or both values are nil.")
        }
    }

    
    private func fetchHoldings() {
        var totalValue = 0.0
        let holdingsURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/holdings")!
        URLSession.shared.dataTask(with: holdingsURL) { data, response, error in
            self.handleHoldingsResponse(data: data, error: error) { holdingsData in
                if let holdingsData = holdingsData {
                    
                    let group = DispatchGroup()
                    
                    for holding in holdingsData {
                        group.enter()
                        let quoteURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/quote/\(holding.ticker)")!
                        URLSession.shared.dataTask(with: quoteURL) { data, response, error in
                            if let data = data {
                                do {
                                    let quoteData = try JSONDecoder().decode(QuoteData.self, from: data)
                                    let currentValue = quoteData.c * Double(holding.quantity)
                                    totalValue += currentValue
                                    print(totalValue)
                                    DispatchQueue.main.async {
                                        self.quoteDataDictionary[holding.ticker] = quoteData
                                        
                                    }
                                } catch {
                                    print("Error decoding quote data for \(holding.ticker): \(error)")
                                }
                            }
                            group.leave()
                        }.resume()
                    }
                    group.notify(queue: .main) {
                        DispatchQueue.main.async {
                            self.totalCostVal = totalValue
                            finalTot()
                            if totalValue == 0 {
                                self.netWorth = self.cashBalance
                            }
                            self.isFetchingData = false
                            self.hasFetchedData = true
                        }
                    }
                }
            }
        }.resume()
    }
    
    private func fetchFavorites() {
        let favoritesURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/favorites")!
        URLSession.shared.dataTask(with: favoritesURL) { data, response, error in
            if let data = data {
                self.handleFavoriteResponse(data: data, error: error)
            }
        }.resume()
    }
    
    private func handleFavoriteResponse(data: Data?, error: Error?) {
        guard let data = data else {
            print("No data returned.")
            return
        }
        
        let decoder = JSONDecoder()
        do {
            let favorites = try decoder.decode([Favorite].self, from: data)
            DispatchQueue.main.async {
                self.favorites = favorites
                self.fetchQuoteDataForFavorites()
            }
        } catch {
            print("Error decoding favorites data: \(error)")
        }
    }
    
    private func handleHoldingsResponse(data: Data?, error: Error?, completion: @escaping ([Holding]?) -> Void) {
        guard let data = data else {
            print("No data returned.")
            return
        }
        
        let decoder = JSONDecoder()
        do {
            let holdingsData = try decoder.decode([Holding].self, from: data)
            completion(holdingsData)
            self.holdings = holdingsData
        } catch {
            print("Error decoding holdings data: \(error)")
        }
    }
    
    func calculateCardHeight() -> CGFloat {
        let netWorthHeight: CGFloat = 100 // Assuming height of net worth text
        let dividerHeight: CGFloat = 1 // Height of divider
        let holdingHeight: CGFloat = 80 // Assuming height of each holding row
        let holdingCount = holdings.count
        let holdingDataHeight = CGFloat(holdingCount) * (holdingHeight + dividerHeight)
        let totalHeight = netWorthHeight + dividerHeight + holdingDataHeight // 230 is padding from top for holding data
        return totalHeight
    }
    
    func calculateFavoriteHeight() -> CGFloat {
        let dividerHeight: CGFloat = 1 // Height of divider
        let favHeight: CGFloat = 54 // Assuming height of each holding row
        let favoriteCount = favorites.count
        if favoriteCount == 0{
            return 0
        }
        let favDataHeight = CGFloat(favoriteCount) * (favHeight + dividerHeight) + 35
        return favDataHeight
    }
    
    private func handleResponse(data: Data?, error: Error?, completion: @escaping ([Money]?) -> Void) {
        isFetchingData = false // Set isFetchingData to false before handling response
        guard let data = data else {
            print("No data returned.")
            return
        }
        
        let decoder = JSONDecoder()
        do {
            let moneyData = try decoder.decode([Money].self, from: data)
            completion(moneyData)
        } catch {
            print("Error decoding data: \(error)")
        }
    }
    
    private func deleteFavorites(at offsets: IndexSet) {
        // Get the favorites at the specified offsets
        let favoritesToDelete = offsets.map { favorites[$0] }
        
        // Delete each favorite
        for favorite in favoritesToDelete {
            deleteFavorite(favorite)
        }
    }
    private func deleteFavorite(_ favorite: Favorite) {
        // Prepare the request body
        let requestBody: [String: String] = [
            "ticker": favorite.ticker
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
                print("Error deleting favorite: \(error)")
                return
            }
            
            // Remove the favorite from the array
            DispatchQueue.main.async {
                if let index = favorites.firstIndex(where: { $0._id == favorite._id }) {
                    favorites.remove(at: index)
                }
            }
        }.resume()
    }
    
}
struct SearchView: View {
    @Binding var text: String
    @Binding var searchResults: [SearchResult]
    @Binding var isSearchBarTapped: Bool // Add this
    @Binding var holdings: [Holding]
    @Binding var favorites: [Favorite]
    @State private var isEditing = true
    
    var body: some View {
        VStack {HStack{
            TextField("Search", text: $text)
                .padding(7)
                .frame(width: 240)
                .padding(.horizontal, 30)
                .background(Color(.systemGray5))
                .cornerRadius(8)
                .overlay(
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                            .frame(minWidth: 0, maxWidth: .infinity, alignment: .leading)
                            .padding(.leading, 8)
                        
                        if isEditing {
                            Button(action: {
                                
                                self.text = ""
                                self.searchResults = []
                            }) {
                                Image(systemName: "multiply.circle.fill")
                                    .foregroundColor(.gray)
                                    .padding(.trailing, 8)
                            }
                        }
                    }
                )
                .padding(.horizontal, 10)
                .onTapGesture {
                    self.isEditing = true
                    self.isSearchBarTapped = true
                }
                .onChange(of: self.text) { searchText in // Move onChange inside VStack
                    if !searchText.isEmpty {
                        self.searchResults = []
                        print(searchText)
                        self.fetchSearchResults(for: searchText)
                    } else {
                        self.searchResults = []
                    }
                }
            
            if isEditing {
                HStack {
                    Spacer() // To push the button to the right side
                    Button(action: {
                        self.text = ""
                        self.isSearchBarTapped = false
                        self.searchResults = []
                    }) {
                        Text("Cancel")
                    }
                    .padding(.trailing, 10)
                    .transition(.move(edge: .trailing))
                    .animation(.default)
                }
            }}
        }
        
        if !searchResults.isEmpty {
            VStack(alignment: .leading) {
                ForEach(searchResults, id: \.symbol) { result in
                    NavigationLink(destination: StockDetails(portfolio: $holdings, favorites: $favorites,symbol: result.symbol)) {
                        VStack(alignment: .leading) {
                            Text(result.symbol)
                                .font(.headline)
                                .foregroundColor(.black)
                            Text(result.description)
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                        .padding(.vertical, 5)
                        .padding(.horizontal, 5)
                    }
                    .padding(.horizontal, 15) // Add padding here if needed
                    Divider() // Add divider between each search result
                }
            }
            .navigationBarTitle("Stocks", displayMode: .inline)
            .padding()
            .padding(.horizontal, 15)
            .frame(width: 350)
            .background(Color.white)
            .cornerRadius(8)
        }
        
    }
    
    private func fetchSearchResults(for searchText: String) {
        self.searchResults = []
        let searchURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/auto/\(searchText)")!
        URLSession.shared.dataTask(with: searchURL) { data, response, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let searchResultResponse = try decoder.decode(SearchResultResponse.self, from: data)
                    let searchResults = searchResultResponse.result
                    DispatchQueue.main.async {
                        self.searchResults = searchResults.filter { !$0.symbol.contains(".") } // Filter out results with "."
                    }
                } catch {
                    print("Error decoding search results: \(error)")
                }
            }
        }.resume()
    }
}

#if DEBUG
struct FirstPage_Previews: PreviewProvider {
    static var previews: some View {
        FirstPage()
    }
}
#endif
