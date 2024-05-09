import SwiftUI

struct ToastView: View {
    let message: String
    
    var body: some View {
        Text(message)
            .foregroundColor(.white)
            .padding(.horizontal, 50)
            .padding(.vertical, 20)
            .background(Color.gray)
            .cornerRadius(30)
    }
}

struct TradeView: View {
    @Binding var showTradeView: Bool
    let stockName: String
    let stockTicker: String
    let availableAmount: Double
    let stockData: CompanyProfile?
    let quoteData: QuoteData?
    @Binding var portfolio: [Holding]
    @State private var quantity: String = ""
    @State private var isBuying: Bool = true
    @State private var tradeSuccessMessage: String = ""
    @State private var navigateToFirstPage = false
    
    @State private var showFundsInsufficientToast = false
    @State private var showInvalidQuantityToast = false
    @State private var showExcessSharesToast = false
    @State private var showInvalidAmountToast = false
    
    var body: some View {
        ZStack{
            
            if tradeSuccessMessage.isEmpty{
                VStack {
                    HStack {
                        Spacer()
                        Button(action: {
                            // Close the TradeView sheet
                            showTradeView.toggle()
                        }) {
                            Image(systemName: "xmark")
                                .font(.title)
                                .foregroundColor(.gray)
                                .padding()
                        }
                    }
                    .padding()
                    
                    Text("Trade \(stockData?.name ?? "") shares")
                        .fontWeight(.bold)
                    
                    //                    Spacer().frame(height:100)
                    Spacer()
                    
                    HStack {
                        TextField("0", text: $quantity)
                            .padding()
                            .frame(width: 200, height: nil)
                            .background(Color.white)
                            .font(Font.system(size: 100, weight: .regular))
                        
                        Spacer()
                        VStack(alignment: .trailing){
                            
                            let quantityInt = Int(quantity) ?? 0
                            let totalPrice = calculateTotalPrice(quantity: quantityInt)
                            
                            if quantityInt <= 1 {
                                Text("Share")
                                    .font(Font.system(size: 20, weight: .regular))
                            } else {
                                Text("Shares")
                                    .font(Font.system(size: 20, weight: .regular))
                            }
                            
                            Text("\(quantity) x $\(String(format: "%.2f", quoteData?.c ?? 0)) /share = $\(String(format: "%.2f", totalPrice))")
                                .frame(width: 170, height: nil)
                                .font(Font.system(size: 14, weight: .regular))
                                .padding(.top, 3)
                            
                            
                        }
                    }.padding(.horizontal, 30)
                    
                    Spacer()
                    
                    // Display available amount
                    Text("$\(String(format: "%.2f", availableAmount)) available to buy \(stockData?.ticker ?? "")")
                        .padding()
                        .foregroundColor(Color.gray)
                    
                    
                    // Buy/Sell buttons
                    ZStack{HStack(spacing: 20) {
                        
                        Button(action: {
                            isBuying = true // Set isBuying to true for buying
                            performTrade()
                        }) {
                            Text("Buy")
                                .padding(.horizontal, 60)
                                .padding(.vertical, 14)
                                .foregroundColor(.white)
                                .background(Color.green)
                                .cornerRadius(20)
                        }
                        
                        Button(action: {
                            isBuying = false // Set isBuying to false for selling
                            performTrade()
                        }) {
                            Text("Sell")
                                .padding(.horizontal, 60)
                                .padding(.vertical, 14)
                                .foregroundColor(.white)
                                .background(Color.green)
                                .cornerRadius(20)
                            
                        }
                        
                    }
                    .padding()
                        
                        if showFundsInsufficientToast {
                            ToastView(message: "Not enough money to buy")
                                .onAppear {
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                        self.showFundsInsufficientToast = false
                                    }
                                }
                        }
                        if showInvalidQuantityToast {
                            ToastView(message: "Cannot \(isBuying ? "buy" : "sell") non-positive shares")
                                .onAppear {
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                        self.showInvalidQuantityToast = false
                                    }
                                }
                        }
                        if showExcessSharesToast {
                            ToastView(message: "Not enough to sell")
                                .onAppear {
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                        self.showExcessSharesToast = false
                                    }
                                }
                        }
                        if showInvalidAmountToast {
                            ToastView(message: "Please enter a valid amount")
                                .onAppear {
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                        self.showInvalidAmountToast = false
                                    }
                                }
                        }
                        
                    }
                    
                    
                }}
            
            if !tradeSuccessMessage.isEmpty {
                Color.green.edgesIgnoringSafeArea(.all)
                VStack {
                    Spacer().frame(height:300)
                    Text("Congratulations!")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text("You have successfully \(isBuying ? "bought" : "sold") \(quantity) \(quantity == "1" ? "share" : "shares") of \(stockTicker)")
                        .frame(width: 400)
                        .foregroundColor(.white)
                        .padding()
                    Spacer().frame(height:300)
                    Button(action: {
                        // Close the TradeView sheet
                        showTradeView.toggle()
                    }) {
                        Text("Done")
                            .foregroundColor(.green) // Green text color
                            .padding(.horizontal, 70)
                            .padding(.vertical, 10)
                            .background(Color.white) // White background
                            .cornerRadius(20) // Rounded corners
                    }
                }
                
                .padding(.horizontal, 0)
                .background(Color.green)
                .zIndex(1)
                
            }
            
        }
        .animation(tradeSuccessMessage.isEmpty ? nil : .easeInOut(duration: 0.5))
        
    }
    
    // Function to calculate total price of trade
    func calculateTotalPrice(quantity: Int) -> Double {
        // Replace this with your calculation logic based on stock price and quantity
        return Double(quantity) * (quoteData?.c ?? 0)
    }
    
    // Function to perform trade action
    func performTrade() {
        print(isBuying)
        // Replace this with your actual trade logic
        guard let quantityInt = Int(quantity) else {
            // Show invalid amount toast if quantity cannot be converted to an integer
            showInvalidAmountToast = true
            return
        }
        
        if quantityInt <= 0 {
            // Show invalid quantity toast if quantity is not greater than 0
            showInvalidQuantityToast = true
            return
        }
        if isBuying{
            
            let totalCost = calculateTotalPrice(quantity: Int(quantity) ?? 0)
            if totalCost > availableAmount {
                showFundsInsufficientToast = true
                return
            }}
        
        // Check for selling more shares than owned
        if !isBuying {
            if Int(quantity) ?? 0 <= 0 {
                // Show invalid quantity toast if quantity is not greater than 0
                showInvalidQuantityToast = true
                return
            }
            
            if let holding = portfolio.first(where: { $0.ticker == stockData?.ticker ?? "" }) {
                if let quantityInt = Int(quantity), quantityInt > holding.quantity {
                    print("YAS KING")
                    showExcessSharesToast = true
                    return
                }
            } else {
                showExcessSharesToast = true
                return
            }
        }
        // Simulating trade success message
        if let quantityInt = Int(quantity), quantityInt > 0 {
            let action = isBuying ? "bought" : "sold"
            let shares = quantityInt == 1 ? "share" : "shares"
            tradeSuccessMessage = "Successfully \(action) \(quantity) \(shares) of \(stockName)"
            updateBackend()
            
            
        }
    }
    
    
    
    // Function to update backend holding and money details
    func updateBackend() {
        // Update holding
        guard let holdingsURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/holdings") else {
            print("Invalid holdings URL")
            return
        }
        let totalCost = calculateTotalPrice(quantity: Int(quantity) ?? 0)
        var newCost: Double = 0
        var currQuant: Int = 0
        if isBuying {
            newCost = totalCost
            currQuant = Int(quantity) ?? 0
            
        } else {
            newCost = -totalCost
            currQuant = -(Int(quantity) ?? 0)
            print(newCost)
        }
        let holdingRequestBody = [
            "ticker": stockData?.ticker as Any,
            "quantity": currQuant,
            "cost": newCost
        ] as [String : Any]
        
        var holdingRequest = URLRequest(url: holdingsURL)
        holdingRequest.httpMethod = "POST"
        holdingRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            holdingRequest.httpBody = try JSONSerialization.data(withJSONObject: holdingRequestBody, options: [])
        } catch {
            print("Error encoding holding request body: \(error)")
            return
        }
        
        // Update money
        guard let moneyURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/update-money") else {
            print("Invalid money URL")
            return
        }
        
        // First, retrieve the current money details from the backend
        let moneyDetailsURL = URL(string: "https://assgn-3-stock-search.wl.r.appspot.com/money")!
        
        var moneyRequest = URLRequest(url: moneyDetailsURL)
        moneyRequest.httpMethod = "GET"
        moneyRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        URLSession.shared.dataTask(with: moneyRequest) { data, response, error in
            guard let data = data, error == nil else {
                print("Error retrieving money details: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            do {
                let moneyDetails = try JSONDecoder().decode([Money].self, from: data)
                
                // Assuming money details array contains only one element
                if let moneyDetail = moneyDetails.first {
                    let currentMoney = moneyDetail.money
                    var newMoney = currentMoney
                    if isBuying{
                        newMoney -= calculateTotalPrice(quantity: Int(quantity) ?? 0)
                    }
                    else{
                        newMoney += calculateTotalPrice(quantity: Int(quantity) ?? 0)
                    }
                    // Prepare the updated money request body
                    let moneyRequestBody = Money(money: newMoney)
                    
                    // Create the money request
                    var moneyUpdateRequest = URLRequest(url: moneyURL)
                    moneyUpdateRequest.httpMethod = "POST"
                    moneyUpdateRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
                    
                    // Encode the money request body
                    do {
                        moneyUpdateRequest.httpBody = try JSONEncoder().encode(moneyRequestBody)
                    } catch {
                        print("Error encoding money request body: \(error)")
                        return
                    }
                    
                    // Send the updated money request
                    URLSession.shared.dataTask(with: moneyUpdateRequest) { _, _, error in
                        if let error = error {
                            print("Error updating money details: \(error)")
                            return
                        }
                        
                        print("Money details updated successfully")
                    }.resume()
                } else {
                    print("Error: No money details found in the response")
                }
            } catch {
                print("Error decoding money details: \(error)")
            }
        }.resume()
        
        // Create a group for concurrent execution of both requests
        let group = DispatchGroup()
        var responseVal = 0
        group.enter()
        URLSession.shared.dataTask(with: holdingRequest) { data, response, error in
            defer {
                group.leave()
            }
            
            if let error = error {
                print("Error updating holdings: \(error)")
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                print("Holdings update response: \(httpResponse.statusCode)")
                responseVal = httpResponse.statusCode
            }
        }.resume()
        
        // Wait for both requests to finish
        group.wait()
        
        if responseVal == 200 || responseVal == 201{
            group.enter()
            URLSession.shared.dataTask(with: holdingsURL) { data, _, error in
                defer { group.leave() }
                guard let data = data else {
                    print("Error: \(error?.localizedDescription ?? "Unknown error")")
                    return
                }
                
                if let decodedResponse = try? JSONDecoder().decode([Holding].self, from: data) {
                    DispatchQueue.main.async {
                        self.portfolio = decodedResponse
                    }
                } else {
                    print("Error: Failed to decode portfolio JSON.")
                }
            }.resume()
            
        }
    }
}

struct TradeView_Previews: PreviewProvider {
    @State static var portfolio: [Holding] = [
        Holding(_id: "1", ticker: "AAPL", quantity: 10, cost: 1500.0, __v: 0),
        Holding(_id: "2", ticker: "GOOG", quantity: 5, cost: 2500.0, __v: 0)
    ]
    
    static var previews: some View {
        let dummyStockName = "AAPL"
        let dummyAvailableAmount = 1000.0
        let dummyStockData = CompanyProfile(ticker: "AAPL", name: "Apple Inc.", logo: "https://example.com/logo.png", country: "USA", currency: "USD", estimateCurrency: "USD", exchange: "NASDAQ", finnhubIndustry: "Technology", ipo: "1980-12-12", marketCapitalization: 2000000000, phone: "123-456-7890", shareOutstanding:00000000, weburl: "https://www.apple.com")
        let dummyQuoteData = QuoteData(c: 150.0, d: 5.0, dp: 3.45, h: 155.0, l: 145.0, o: 148.0, pc: 145.0, t: 123456789)
        
        return TradeView(showTradeView: .constant(true), stockName: dummyStockName, stockTicker: "AAPL", availableAmount: dummyAvailableAmount, stockData: dummyStockData, quoteData: dummyQuoteData, portfolio: $portfolio)
    }
}

