FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY customer-app/CustomerApp.csproj .
RUN dotnet restore CustomerApp.csproj
COPY customer-app/Program.cs .
RUN dotnet publish CustomerApp.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "CustomerApp.dll"]
