import SwiftUI

struct SplashView: View {
    var body: some View {
        ZStack {
            Color(hex: 0xf2f2f4) // Background color
                .ignoresSafeArea()
            
            Image("app icon") // Replace "AppIcon" with the name of your app icon asset
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 300, height: 300) // Adjust size as needed
        }
    }
}

extension Color {
    init(hex: Int, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 8) & 0xff) / 255,
            blue: Double(hex & 0xff) / 255,
            opacity: alpha
        )
    }
}

struct SplashView_Previews: PreviewProvider {
    static var previews: some View {
        SplashView()
    }
}
