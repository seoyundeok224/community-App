import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 100,
    backgroundColor: "#f5f7fa",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    height: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerBar: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b6cb0',
  },
  logoText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2b6cb0",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "#b00020",
    marginBottom: 8,
  },
  passwordInput: {
    width: '100%',
    marginBottom: 12,
  },
  buttonsContainer: {
    marginTop: 12,
    width: "100%",
  },
  buttonSpacing: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2b6cb0",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    color: "#2b6cb0",
    textAlign: "right",
    marginTop: 6,
  },
  smallText: {
    fontSize: 12,
    color: "#666",
  },
});
