import SwiftUI

@main
 0-struct stock_searchApp: App {
    var body: some Scene {
        WindowGroup {
            SplashView()
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        withAnimation {
                            // Wrap transition to FirstPage inside an animation block
                            UIApplication.shared.windows.first?.rootViewController = UIHostingController(rootView: FirstPage())
                        }
                    }
                }
        }
    }
}
