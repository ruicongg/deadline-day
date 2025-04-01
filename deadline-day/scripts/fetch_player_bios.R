# Load necessary libraries
library(worldfootballR)
library(dplyr)
library(tidyr)
library(jsonlite)
library(DBI)
library(RPostgres)

# Function to connect to the database
connect_to_db <- function() {
  # Get database connection details from environment variables
  db_host <- Sys.getenv("PGHOST")
  db_port <- Sys.getenv("PGPORT", "5432")
  db_name <- Sys.getenv("PGDATABASE")
  db_user <- Sys.getenv("PGUSER")
  db_password <- Sys.getenv("PGPASSWORD")
  
  # Connect to the database
  con <- dbConnect(
    Postgres(),
    host = db_host,
    port = db_port,
    dbname = db_name,
    user = db_user,
    password = db_password
  )
  
  return(con)
}

# Function to fetch player URLs from the database
get_player_urls <- function(con, limit = 10, offset = 0) {
  query <- paste0("
    SELECT id, name, transfermarkt_url 
    FROM players 
    WHERE transfermarkt_url IS NOT NULL 
    AND (last_bio_update IS NULL OR last_bio_update < NOW() - INTERVAL '7 days')
    ORDER BY last_bio_update ASC NULLS FIRST
    LIMIT ", limit, " OFFSET ", offset
  )
  
  players <- dbGetQuery(con, query)
  return(players)
}

# Function to update player bio in the database
update_player_bio <- function(con, player_id, bio_data, image_url) {
  query <- "
    UPDATE players 
    SET 
      bio_data = $1,
      image_url = COALESCE($2, image_url),
      last_bio_update = NOW()
    WHERE id = $3
  "
  
  # Convert bio_data to JSON
  bio_json <- toJSON(bio_data, auto_unbox = TRUE)
  
  # Execute the query
  res <- dbSendQuery(con, query)
  dbBind(res, list(bio_json, image_url, player_id))
  dbClearResult(res)
  
  return(TRUE)
}

# Main function to process players
process_players <- function(limit = 10, offset = 0) {
  # Connect to the database
  con <- connect_to_db()
  on.exit(dbDisconnect(con))
  
  # Get player URLs
  players <- get_player_urls(con, limit, offset)
  
  if (nrow(players) == 0) {
    cat("No players found with Transfermarkt URLs to update\n")
    return(NULL)
  }
  
  cat("Processing", nrow(players), "players...\n")
  
  # Process each player
  results <- list()
  
  for (i in 1:nrow(players)) {
    player <- players[i, ]
    cat("Processing player:", player$name, "(", player$id, ")\n")
    
    tryCatch({
      # Fetch player bio
      bio <- tm_player_bio(player_url = player$transfermarkt_url)
      
      # Extract image URL
      image_url <- NULL
      if ("image_url" %in% names(bio)) {
        image_url <- bio$image_url
        bio$image_url <- NULL  # Remove from bio data to avoid duplication
      }
      
      # Update player in database
      update_player_bio(con, player$id, bio, image_url)
      
      results[[i]] <- list(
        id = player$id,
        name = player$name,
        success = TRUE
      )
      
      cat("Successfully updated player:", player$name, "\n")
    }, error = function(e) {
      cat("Error processing player", player$name, ":", e$message, "\n")
      results[[i]] <- list(
        id = player$id,
        name = player$name,
        success = FALSE,
        error = e$message
      )
    })
    
    # Add a small delay to avoid hitting rate limits
    Sys.sleep(1)
  }
  
  return(results)
}

# Parse command line arguments
args <- commandArgs(trailingOnly = TRUE)
limit <- if (length(args) >= 1) as.numeric(args[1]) else 10
offset <- if (length(args) >= 2) as.numeric(args[2]) else 0

# Run the process
results <- process_players(limit, offset)

# Output results as JSON
cat(toJSON(results, auto_unbox = TRUE))

