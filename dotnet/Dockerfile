FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
# Keep the API image build cache sensitive to application packet-shape changes.
WORKDIR /src
COPY dotnet/ ./dotnet/
RUN dotnet publish dotnet/LandOps.Api/LandOps.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "LandOps.Api.dll"]
